import { useEffect, useState } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { farmsAPI } from '../services/api';

export default function FarmsList() {
  const [farms, setFarms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    farmsAPI.getAll().then(({ data }) => setFarms(data)).catch(console.error);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Farms</Typography>
      <Button variant="contained" onClick={() => navigate('/farms/add')} sx={{ mb: 3 }}>
        Add Farm
      </Button>
      <Grid container spacing={3}>
        {farms.map(farm => (
          <Grid item xs={12} md={6} key={farm._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">Land: {farm.landSize} acres</Typography>
                <Typography>Irrigation: {farm.irrigationType}</Typography>
                <Button onClick={() => navigate(`/analysis/${farm._id}`)} sx={{ mt: 2 }}>
                  Analyze
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
