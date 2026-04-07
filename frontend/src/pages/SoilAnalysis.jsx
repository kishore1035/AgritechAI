import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components';
import { Leaf, CheckCircle2 } from 'lucide-react';

/**
 * Soil Analysis Page
 */

function SoilAnalysis({ onAlert }) {
  const { t } = useTranslation();

  const nutrients = [
    { name: t('analysis.nitrogen'), value: 45, unit: 'mg/kg', status: 'good' },
    { name: t('analysis.phosphorus'), value: 32, unit: 'mg/kg', status: 'warning' },
    { name: t('analysis.potassium'), value: 220, unit: 'mg/kg', status: 'good' },
    { name: t('analysis.ph_level'), value: 7.2, unit: 'pH', status: 'good' },
    { name: t('analysis.moisture'), value: 28, unit: '%', status: 'good' },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-900">
      <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header - Minimal */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">
          {t('analysis.title')}
        </h1>
        <p className="text-xs text-neutral-400">
          Soil composition and health metrics
        </p>
      </div>

      {/* Soil Profile Card - Tab-based minimal */}
      <Card>
        <Card.Header
          title={t('analysis.soil_profile')}
          subtitle="Field 1 - Main plot"
        />
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-xs text-neutral-400 uppercase tracking-wide mb-3">
                {t('analysis.nutrients')}
              </h3>
              <div className="space-y-2">
                {nutrients.map((nutrient, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      {nutrient.name}
                    </span>
                    <span className="font-semibold text-neutral-200">
                      {nutrient.value} {nutrient.unit}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      nutrient.status === 'good' ? 'bg-success' : 
                      nutrient.status === 'warning' ? 'bg-warning' : 
                      'bg-error'
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-xs text-neutral-400 uppercase tracking-wide mb-3">
                Summary
              </h3>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-primary-500/10">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Soil Type
                  </p>
                  <p className="font-semibold text-neutral-100 text-sm">
                    Loamy soil
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-success/10">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Overall Health
                  </p>
                  <p className="font-semibold text-success text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Excellent
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-800/50">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Last Updated
                  </p>
                  <p className="text-xs text-neutral-400">
                    2 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Recommendations - Expandable minimal */}
      <Card>
        <Card.Header
          title={t('analysis.recommendations')}
          action={<Leaf className="text-primary-500" size={20} />}
        />
        <Card.Body>
          <ul className="space-y-1.5">
            <li className="flex gap-2 text-xs">
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300">Increase Phosphorus with organic manure</span>
            </li>
            <li className="flex gap-2 text-xs">
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300">Nitrogen levels optimal for wheat</span>
            </li>
            <li className="flex gap-2 text-xs">
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300">pH ideal - maintain moisture balance</span>
            </li>
          </ul>
        </Card.Body>
        <Card.Footer>
          <Button variant="success" size="sm">Apply Recommendations</Button>
        </Card.Footer>
      </Card>
      </div>
    </div>
  );
}

export default SoilAnalysis;
