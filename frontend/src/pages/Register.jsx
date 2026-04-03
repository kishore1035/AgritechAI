import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, TextField, Button, Typography, Paper, MenuItem } from '@mui/material';
import { authAPI } from '../services/api';

export default function Register({ setAuth }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', password: '', district: '', state: '', village: '', language: 'en'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            {t('register')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label={t('name')} value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} margin="normal" required />
            <TextField fullWidth label={t('phone')} value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})} margin="normal" required />
            <TextField fullWidth label={t('password')} type="password" value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} margin="normal" required />
            <TextField fullWidth label={t('state')} value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})} margin="normal" required />
            <TextField fullWidth label={t('district')} value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})} margin="normal" required />
            <TextField fullWidth label={t('village')} value={formData.village}
              onChange={(e) => setFormData({...formData, village: e.target.value})} margin="normal" />
            <TextField select fullWidth label="Language" value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})} margin="normal">
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="kn">ಕನ್ನಡ</MenuItem>
              <MenuItem value="hi">हिंदी</MenuItem>
              <MenuItem value="ta">தமிழ்</MenuItem>
              <MenuItem value="te">తెలుగు</MenuItem>
            </TextField>
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              {t('register')}
            </Button>
            <Button fullWidth onClick={() => navigate('/login')} sx={{ mt: 1 }}>
              {t('login')}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
