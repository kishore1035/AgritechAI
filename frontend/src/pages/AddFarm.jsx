import { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { farmsAPI } from '../services/api';

export default function AddFarm() {
  const [formData, setFormData] = useState({
    landSize: '', irrigationType: 'rainfed',
    currentSoilHealth: { N: '', P: '', K: '', pH: '', organicCarbon: '' }
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await farmsAPI.create(formData);
      navigate('/farms');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Add Farm</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Land Size (acres)" type="number" value={formData.landSize}
            onChange={(e) => setFormData({...formData, landSize: e.target.value})} margin="normal" required />
          <TextField select fullWidth label="Irrigation Type" value={formData.irrigationType}
            onChange={(e) => setFormData({...formData, irrigationType: e.target.value})} margin="normal">
            <MenuItem value="rainfed">Rainfed</MenuItem>
            <MenuItem value="canal">Canal</MenuItem>
            <MenuItem value="drip">Drip</MenuItem>
            <MenuItem value="sprinkler">Sprinkler</MenuItem>
          </TextField>
          <Typography variant="h6" sx={{ mt: 2 }}>Soil Health</Typography>
          <TextField fullWidth label="Nitrogen (N) kg/acre" type="number" value={formData.currentSoilHealth.N}
            onChange={(e) => setFormData({...formData, currentSoilHealth: {...formData.currentSoilHealth, N: e.target.value}})} margin="normal" />
          <TextField fullWidth label="Phosphorus (P) kg/acre" type="number" value={formData.currentSoilHealth.P}
            onChange={(e) => setFormData({...formData, currentSoilHealth: {...formData.currentSoilHealth, P: e.target.value}})} margin="normal" />
          <TextField fullWidth label="Potassium (K) kg/acre" type="number" value={formData.currentSoilHealth.K}
            onChange={(e) => setFormData({...formData, currentSoilHealth: {...formData.currentSoilHealth, K: e.target.value}})} margin="normal" />
          <TextField fullWidth label="pH Level" type="number" value={formData.currentSoilHealth.pH}
            onChange={(e) => setFormData({...formData, currentSoilHealth: {...formData.currentSoilHealth, pH: e.target.value}})} margin="normal" />
          <TextField fullWidth label="Organic Carbon %" type="number" value={formData.currentSoilHealth.organicCarbon}
            onChange={(e) => setFormData({...formData, currentSoilHealth: {...formData.currentSoilHealth, organicCarbon: e.target.value}})} margin="normal" />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Save Farm</Button>
        </form>
      </Paper>
    </Container>
  );
}
