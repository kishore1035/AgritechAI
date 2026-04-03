import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, TextField, Button, Typography, Paper } from '@mui/material';
import { authAPI } from '../services/api';

export default function Login({ setAuth }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.login({ phone, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {t('app_title')}
          </Typography>
          <Typography variant="h5" align="center" gutterBottom>
            {t('login')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              {t('login')}
            </Button>
            <Button fullWidth onClick={() => navigate('/register')} sx={{ mt: 1 }}>
              {t('register')}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
