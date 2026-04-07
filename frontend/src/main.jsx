import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import App from './App.jsx';

// Import translations
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import knTranslations from './locales/kn.json';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      ta: { translation: taTranslations },
      te: { translation: teTranslations },
      kn: { translation: knTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
