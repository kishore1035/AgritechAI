import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, CardContent, Grid, Chip, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { farmsAPI, predictionsAPI } from '../services/api';

export default function SoilAnalysis() {
  const { farmId } = useParams();
  const [farm, setFarm] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [rotation, setRotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: farmData } = await farmsAPI.getOne(farmId);
        setFarm(farmData);
        
        const { data: predData } = await predictionsAPI.analyze(farmData);
        setPrediction(predData);
        
        const { data: rotData } = await predictionsAPI.getRotation(farmData);
        setRotation(rotData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [farmId]);

  if (loading) return <CircularProgress />;

  const chartData = prediction?.nutrientDepletion.N.projected.map((_, i) => ({
    season: `Season ${i+1}`,
    N: prediction.nutrientDepletion.N.projected[i],
    P: prediction.nutrientDepletion.P.projected[i],
    K: prediction.nutrientDepletion.K.projected[i],
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Soil Analysis</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Risk Assessment</Typography>
          <Chip label={`Risk: ${prediction?.riskScore}`} color={prediction?.riskScore === 'Low' ? 'success' : 'error'} />
          <Typography>Yield Decline Probability: {prediction?.yieldDeclineProbability}%</Typography>
          <Typography>Economic Loss: ₹{prediction?.economicLoss}/acre</Typography>
          <Typography>Recovery Timeline: {prediction?.soilRecoveryTimeline} months</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Nutrient Depletion Trend</Typography>
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="season" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="N" stroke="#8884d8" />
            <Line type="monotone" dataKey="P" stroke="#82ca9d" />
            <Line type="monotone" dataKey="K" stroke="#ffc658" />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Crop Rotation Recommendations</Typography>
          {rotation?.recommendations.map((rec, i) => (
            <Card key={i} sx={{ mt: 2 }}>
              <CardContent>
                <Typography><strong>{rec.season}:</strong> {rec.crop}</Typography>
                <Typography variant="body2">{rec.reason}</Typography>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
