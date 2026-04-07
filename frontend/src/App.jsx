import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './styles/globals.css';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import SoilAnalysis from './pages/SoilAnalysis';
import WaterManagement from './pages/WaterManagement';
import MarketIntelligence from './pages/MarketIntelligence';
import PlantScanner from './pages/PlantScanner';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Navigation from './components/Navigation';
import { AlertContainer } from './components';

function App() {
  const { i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);

  // Initialize i18n
  useEffect(() => {
    const savedLanguage = localStorage.getItem('agritech-language') || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const showAlert = (type, title, message, autoClose = 5000) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, title, message, autoClose }]);
  };

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onAlert={showAlert} />;
      case 'analysis':
        return <SoilAnalysis onAlert={showAlert} />;
      case 'water':
        return <WaterManagement onAlert={showAlert} />;
      case 'market':
        return <MarketIntelligence onAlert={showAlert} />;
      case 'scanner':
        return <PlantScanner onAlert={showAlert} />;
      case 'alerts':
        return <Alerts onAlert={showAlert} />;
      case 'profile':
        return <Profile onAlert={showAlert} />;
      default:
        return <Dashboard onAlert={showAlert} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 md:flex">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Main Content */}
        <main className="min-h-screen w-full overflow-y-auto pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                mass: 0.5,
              }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Alert Container */}
        <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      </div>
    </ThemeProvider>
  );
}

export default App;
