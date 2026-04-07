import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Alerts Page
 */

function Alerts({ onAlert }) {
  const { t } = useTranslation();

  const alertsList = [
    {
      id: 1,
      type: 'error',
      title: 'Critical: High pest infestation detected',
      message: 'Armyworm activity detected in field 2. Immediate action recommended.',
      time: '2 hours ago',
      field: 'Field 2'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Warning: Water level low',
      message: 'Soil moisture in field 1 is below optimal range. Schedule irrigation.',
      time: '4 hours ago',
      field: 'Field 1'
    },
    {
      id: 3,
      type: 'info',
      title: 'Favorable weather for spraying',
      message: 'Wind speed < 5 km/h and humidity 60-75%. Good conditions for pesticide application.',
      time: '6 hours ago',
      field: 'All fields'
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-900">
      <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header - Minimal */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">
          {t('alerts.title')}
        </h1>
        <p className="text-xs text-neutral-400">
          Important farm and crop notifications
        </p>
      </div>

      {/* Alerts List - Streamlined minimal */}
      <div className="space-y-2">
        {alertsList.map((alert) => (
          <Card
            key={alert.id}
            variant={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'default'}
          >
            <Card.Body>
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  {alert.type === 'error' ? (
                    <AlertCircle className="text-error" size={16} />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="text-warning" size={16} />
                  ) : (
                    <Info className="text-accent-500" size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs text-neutral-100 line-clamp-1">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap flex-shrink-0">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    {alert.field}
                  </p>
                </div>
              </div>
            </Card.Body>
            {(alert.type === 'error' || alert.type === 'warning') && (
              <Card.Footer>
                <Button size="sm" variant="primary" className="text-xs">
                  Action
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  Dismiss
                </Button>
              </Card.Footer>
            )}
          </Card>
        ))}
      </div>

      {/* Alert Preferences - Minimal */}
      <Card>
        <Card.Header
          title="Alert Settings"
          subtitle="Customize notifications"
        />
        <Card.Body className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-xs text-neutral-300">Pest and disease alerts</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-xs text-neutral-300">Weather warnings</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-xs text-neutral-300">Irrigation reminders</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <span className="text-xs text-neutral-300">Market price changes</span>
          </label>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" size="sm" className="text-xs">Save preferences</Button>
        </Card.Footer>
      </Card>
      </div>
    </div>
  );
}

export default Alerts;
