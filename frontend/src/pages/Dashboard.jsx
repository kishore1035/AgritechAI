import { AppBar, Toolbar, Typography, Button, Container, Box, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('app_title')}
          </Typography>
          <Button color="inherit" onClick={() => navigate('/farms')}>{t('my_farms')}</Button>
          <Button color="inherit" onClick={handleLogout}>{t('logout')}</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <AgricultureIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Typography variant="h5" gutterBottom>
                  {t('my_farms')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage your farm profiles
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/farms')}>
                  View Farms
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <AssessmentIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                <Typography variant="h5" gutterBottom>
                  {t('predictions')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get soil health analysis and crop rotation recommendations
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/farms')}>
                  Analyze Soil
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
