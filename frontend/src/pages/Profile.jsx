import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input } from '../components';
import { User } from 'lucide-react';

/**
 * Profile Page
 */

function Profile({ onAlert }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Header - Minimal */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 mb-1">
          {t('profile.title')}
        </h1>
        <p className="text-xs text-neutral-400">
          Farm and account settings
        </p>
      </div>

      {/* Profile Summary - Minimal */}
      <Card>
        <Card.Body>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-primary-400" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-neutral-100">
                Rajesh Kumar
              </h2>
              <p className="text-xs text-neutral-400">
                Farmer • Madhya Pradesh
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Farm Details */}
      <Card>
        <Card.Header title={t('profile.farm_details')} />
        <Card.Body className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t('profile.location')}
              value="Indore, Madhya Pradesh"
              disabled
              size="sm"
            />
            <Input
              label={t('profile.farm_size')}
              value="5 hectares"
              disabled
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">
              {t('profile.crops')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Wheat', 'Cotton', 'Soybeans'].map((crop) => (
                <span
                  key={crop}
                  className="px-2.5 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" size="sm">Edit details</Button>
        </Card.Footer>
      </Card>

      {/* Account Settings */}
      <Card>
        <Card.Header title={t('profile.settings')} />
        <Card.Body>
          <div>
            <h3 className="font-semibold text-xs text-neutral-300 uppercase tracking-wide mb-2">
              Notification Preferences
            </h3>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-xs text-neutral-300">Email notifications</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-xs text-neutral-300">SMS alerts</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-xs text-neutral-300">App notifications</span>
              </label>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Danger Zone - Minimal */}
      <Card>
        <Card.Header title="Account Management" />
        <Card.Body className="space-y-2">
          <p className="text-xs text-neutral-400">
            Sensitive account actions. Proceed with caution.
          </p>
          <div className="flex flex-col gap-1.5">
            <Button variant="danger" size="sm" fullWidth className="text-xs">
              Change Password
            </Button>
            <Button variant="danger" size="sm" fullWidth className="text-xs">
              Logout all devices
            </Button>
            <Button variant="danger" size="sm" fullWidth className="text-xs">
              Delete Account
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;
