import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../components';
import { Droplets } from 'lucide-react';

/**
 * Water Management Page
 */

function WaterManagement({ onAlert }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header - Minimal */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">
          {t('water.title')}
        </h1>
        <p className="text-xs text-neutral-400">
          Irrigation optimization and water usage
        </p>
      </div>

      {/* Water Balance Overview - Horizontal scroll cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card hover>
          <Card.Body className="text-center py-4">
            <p className="text-xs text-neutral-400">{t('water.rainfall')}</p>
            <p className="text-xl font-bold text-accent-500 mt-1">45 mm</p>
            <p className="text-xs text-neutral-500 mt-0.5">This week</p>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="text-center py-4">
            <p className="text-xs text-neutral-400">{t('water.irrigation')}</p>
            <p className="text-xl font-bold text-primary-500 mt-1">120 mm</p>
            <p className="text-xs text-neutral-500 mt-0.5">Applied</p>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="text-center py-4">
            <p className="text-xs text-neutral-400">{t('water.runoff')}</p>
            <p className="text-xl font-bold text-warning mt-1">12 mm</p>
            <p className="text-xs text-neutral-500 mt-0.5">Runoff loss</p>
          </Card.Body>
        </Card>
      </div>

      {/* Irrigation Schedule */}
      <Card>
        <Card.Header
          title={t('water.schedule')}
          subtitle="Recommended irrigation times for optimal crop growth"
        />
        <Card.Body>
          <div className="space-y-3">
            {[
              { day: 'Tomorrow', time: '6:00 AM', duration: '2 hours', amount: '45 mm' },
              { day: 'Day after', time: '5:30 AM', duration: '2.5 hours', amount: '50 mm' },
              { day: 'In 3 days', time: '6:00 AM', duration: '2 hours', amount: '45 mm' },
            ].map((schedule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-neutral-800/50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-xs text-neutral-100">
                    {schedule.day}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {schedule.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs text-neutral-100">
                    {schedule.amount}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {schedule.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" size="sm" className="text-xs">Set reminders</Button>
          <Button variant="outline" size="sm" className="text-xs">Adjust</Button>
        </Card.Footer>
      </Card>

      {/* Water Balance Visualization */}
      <Card>
        <Card.Header title={t('water.water_balance')} />
        <Card.Body>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5 text-xs">
                <span className="font-medium text-neutral-300">Soil Moisture</span>
                <span className="font-bold text-accent-400">65%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-accent-500 h-2 rounded-full transition-all"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5 text-xs">
                <span className="font-medium text-neutral-300">Water Availability</span>
                <span className="font-bold text-primary-400">78%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default WaterManagement;
