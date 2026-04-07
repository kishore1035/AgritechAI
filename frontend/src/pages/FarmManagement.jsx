import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Edit2, Trash2, Droplet, X, 
  Loader2, Map, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Card, Button, Input, Textarea, Modal } from '../components';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FarmManagement = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [showSoilForm, setShowSoilForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    landSize: '',
    irrigationType: 'rainfed',
    location: '',
    latitude: '',
    longitude: ''
  });
  const [soilData, setSoilData] = useState({
    N: 50,
    P: 30,
    K: 40,
    pH: 6.5,
    moisture: 25
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/farms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFarms(data);
        if (data.length > 0 && !selectedFarm) {
          setSelectedFarm(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Farm name is required';
    if (!formData.landSize || formData.landSize <= 0) newErrors.landSize = 'Valid land size is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveFarm = async () => {
    if (!validateForm()) return;

    setSubmitStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const method = editingFarm ? 'PUT' : 'POST';
      const url = editingFarm 
        ? `${API_URL}/api/farms/${editingFarm._id}`
        : `${API_URL}/api/farms`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setShowFarmForm(false);
          setEditingFarm(null);
          setFormData({
            name: '',
            landSize: '',
            irrigationType: 'rainfed',
            location: '',
            latitude: '',
            longitude: ''
          });
          setSubmitStatus(null);
          fetchFarms();
        }, 1000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Failed to save farm:', error);
      setSubmitStatus('error');
    }
  };

  const handleDeleteFarm = async () => {
    if (!farmToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/farms/${farmToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setFarmToDelete(null);
        if (selectedFarm?._id === farmToDelete._id) {
          setSelectedFarm(null);
        }
        fetchFarms();
      }
    } catch (error) {
      console.error('Failed to delete farm:', error);
    }
  };

  const handleSubmitSoil = async () => {
    if (!selectedFarm) return;

    setSubmitStatus('loading');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/soil/readings/${selectedFarm._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(soilData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setShowSoilForm(false);
          setSubmitStatus(null);
          fetchFarms();
        }, 1000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Failed to submit soil reading:', error);
      setSubmitStatus('error');
    }
  };

  const openEditForm = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      landSize: farm.landSize || '',
      irrigationType: farm.irrigationType || 'rainfed',
      location: farm.location || '',
      latitude: farm.latitude || '',
      longitude: farm.longitude || ''
    });
    setShowFarmForm(true);
  };

  const openAddForm = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      landSize: '',
      irrigationType: 'rainfed',
      location: '',
      latitude: '',
      longitude: ''
    });
    setErrors({});
    setShowFarmForm(true);
  };

  const confirmDelete = (farm) => {
    setFarmToDelete(farm);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#F5F1ED] mb-2">
          Farm Management
        </h1>
        <p className="text-sm text-[#8B7355]">
          Manage your farms and track soil health
        </p>
      </div>

      {/* Asymmetric Layout: List (left) + Details (right) - DESIGN_VARIANCE=7 */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left: Farm List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F5F1ED]">Your Farms</h2>
            <Button
              onClick={openAddForm}
              className="px-4 py-2 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Farm
            </Button>
          </div>

          {loading ? (
            <FarmListSkeleton />
          ) : farms.length === 0 ? (
            <EmptyState onAddFarm={openAddForm} />
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.08 }}
            >
              {farms.map((farm) => (
                <FarmCard
                  key={farm._id}
                  farm={farm}
                  isSelected={selectedFarm?._id === farm._id}
                  onClick={() => setSelectedFarm(farm)}
                  onEdit={() => openEditForm(farm)}
                  onDelete={() => confirmDelete(farm)}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: Farm Details & Soil Readings */}
        <div className="space-y-4">
          {selectedFarm ? (
            <>
              <FarmDetailsCard farm={selectedFarm} />
              <SoilReadingsCard
                farm={selectedFarm}
                onAddReading={() => setShowSoilForm(true)}
              />
            </>
          ) : (
            !loading && farms.length > 0 && (
              <div className="rounded-xl bg-[#1A1A1A] border border-[#4A4A4A]/30 p-12 text-center">
                <Map size={48} className="mx-auto mb-4 text-[#8B7355]" />
                <p className="text-[#8B7355]">Select a farm to view details</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Farm Form Modal */}
      <Modal open={showFarmForm} onClose={() => setShowFarmForm(false)} size="lg">
        <Modal.Header
          title={editingFarm ? 'Edit Farm' : 'Add New Farm'}
          subtitle="Manage your farm information"
          onClose={() => setShowFarmForm(false)}
        />
        <Modal.Body>
          <FarmForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submitStatus={submitStatus}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowFarmForm(false)}
            className="px-5 py-2.5 rounded-lg text-[#F5F1ED] font-medium hover:bg-[#1A1A1A] active:scale-[0.98] transition-all duration-150"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveFarm}
            disabled={submitStatus === 'loading'}
            className="px-5 py-2.5 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {submitStatus === 'success' && <CheckCircle2 size={16} />}
            {editingFarm ? 'Update Farm' : 'Add Farm'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Soil Readings Modal */}
      <Modal open={showSoilForm} onClose={() => setShowSoilForm(false)} size="lg">
        <Modal.Header
          title="Add Soil Reading"
          subtitle={`Record soil health for ${selectedFarm?.name || 'farm'}`}
          onClose={() => setShowSoilForm(false)}
        />
        <Modal.Body>
          <SoilReadingsForm
            soilData={soilData}
            setSoilData={setSoilData}
            submitStatus={submitStatus}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowSoilForm(false)}
            className="px-5 py-2.5 rounded-lg text-[#F5F1ED] font-medium hover:bg-[#1A1A1A] active:scale-[0.98] transition-all duration-150"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitSoil}
            disabled={submitStatus === 'loading'}
            className="px-5 py-2.5 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {submitStatus === 'success' && <CheckCircle2 size={16} />}
            Submit Reading
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md">
        <Modal.Header
          title="Delete Farm"
          onClose={() => setShowDeleteModal(false)}
        />
        <Modal.Body>
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={24} className="text-[#B45309] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F5F1ED] mb-2">
                Are you sure you want to delete <strong>{farmToDelete?.name}</strong>?
              </p>
              <p className="text-sm text-[#8B7355]">
                This action cannot be undone. All soil readings and farm data will be permanently removed.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowDeleteModal(false)}
            className="px-5 py-2.5 rounded-lg text-[#F5F1ED] font-medium hover:bg-[#1A1A1A] active:scale-[0.98] transition-all duration-150"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteFarm}
            className="px-5 py-2.5 rounded-lg bg-[#B45309] text-white font-medium shadow-[0_2px_4px_rgba(180,83,9,0.2)] hover:bg-[#9A3F07] active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Farm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================
// COMPONENT: FarmCard
// ============================================
const FarmCard = ({ farm, isSelected, onClick, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'rounded-xl p-4 border transition-all duration-300 cursor-pointer group',
        isSelected
          ? 'bg-[#EEF4E8]/10 border-[#3B6D11] shadow-[0_4px_16px_rgba(59,109,17,0.12)]'
          : 'bg-[#1A1A1A] border-[#4A4A4A]/30 hover:border-[#3B6D11]/50 hover:shadow-[0_2px_8px_rgba(59,109,17,0.08)]'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#F5F1ED] truncate mb-1">
            {farm.name || 'Unnamed Farm'}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-[#8B7355]">
            <MapPin size={14} />
            <span className="truncate">{farm.location || 'No location'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-md hover:bg-[#3B6D11]/20 text-[#3B6D11] transition-colors"
            aria-label="Edit farm"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-[#B45309]/20 text-[#B45309] transition-colors"
            aria-label="Delete farm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#0A0A0A]/50 rounded-lg p-2">
          <p className="text-[#8B7355] uppercase tracking-wide mb-0.5">Land Size</p>
          <p className="font-semibold text-[#F5F1ED]">{farm.landSize || 0} acres</p>
        </div>
        <div className="bg-[#0A0A0A]/50 rounded-lg p-2">
          <p className="text-[#8B7355] uppercase tracking-wide mb-0.5">Irrigation</p>
          <p className="font-semibold text-[#F5F1ED] capitalize">{farm.irrigationType || 'N/A'}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENT: FarmDetailsCard
// ============================================
const FarmDetailsCard = ({ farm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl bg-[#1A1A1A] p-6 border border-[#4A4A4A]/30 shadow-[0_2px_8px_rgba(59,109,17,0.08)]"
    >
      <h2 className="text-xl font-semibold text-[#F5F1ED] mb-4">Farm Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Farm Name" value={farm.name || 'N/A'} />
        <DetailItem label="Land Size" value={`${farm.landSize || 0} acres`} />
        <DetailItem label="Irrigation Type" value={farm.irrigationType || 'N/A'} className="capitalize" />
        <DetailItem label="Location" value={farm.location || 'N/A'} />
        {farm.latitude && farm.longitude && (
          <div className="col-span-full">
            <DetailItem
              label="Coordinates"
              value={`${farm.latitude}°, ${farm.longitude}°`}
            />
          </div>
        )}
      </div>

      {farm.currentSoilHealth && (
        <div className="mt-6 pt-6 border-t border-[#4A4A4A]/30">
          <h3 className="text-sm font-semibold text-[#F5F1ED] mb-3 uppercase tracking-wide">
            Latest Soil Health
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SoilMetric label="N" value={farm.currentSoilHealth.N} unit="mg/kg" />
            <SoilMetric label="P" value={farm.currentSoilHealth.P} unit="mg/kg" />
            <SoilMetric label="K" value={farm.currentSoilHealth.K} unit="mg/kg" />
            <SoilMetric label="pH" value={farm.currentSoilHealth.pH} unit="" />
            <SoilMetric label="Moisture" value={farm.currentSoilHealth.moisture} unit="%" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DetailItem = ({ label, value, className }) => (
  <div>
    <p className="text-xs text-[#8B7355] uppercase tracking-wide mb-1">{label}</p>
    <p className={cn("text-sm font-medium text-[#F5F1ED]", className)}>{value}</p>
  </div>
);

const SoilMetric = ({ label, value, unit }) => (
  <div className="bg-[#0A0A0A]/50 rounded-lg p-2.5">
    <p className="text-xs text-[#8B7355] uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-semibold text-[#F5F1ED]">
      {value !== undefined ? `${value}${unit}` : 'N/A'}
    </p>
  </div>
);

// ============================================
// COMPONENT: SoilReadingsCard
// ============================================
const SoilReadingsCard = ({ farm, onAddReading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="rounded-xl bg-[#1A1A1A] p-6 border border-[#4A4A4A]/30 shadow-[0_2px_8px_rgba(59,109,17,0.08)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#F5F1ED]">Soil Readings</h2>
        <Button
          onClick={onAddReading}
          className="px-4 py-2 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
        >
          <Droplet size={16} />
          Add Reading
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[#8B7355]">
          Track NPK levels, pH, and moisture to optimize crop yield.
        </p>
        
        {!farm.currentSoilHealth && (
          <div className="rounded-lg bg-[#0D4A6B]/10 border-l-4 border-[#0D4A6B] p-4">
            <p className="text-sm text-[#F5F1ED]">
              No soil readings yet. Add your first reading to start tracking soil health.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// COMPONENT: FarmForm
// ============================================
const FarmForm = ({ formData, setFormData, errors, submitStatus }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Farm Name - RULE 6: Label ABOVE input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
          Farm Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., North Field"
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 bg-[#0A0A0A] text-[#F5F1ED] placeholder:text-[#4A4A4A] focus:outline-none focus:ring-2 transition-all',
            errors.name
              ? 'border-[#B45309] focus:border-[#B45309] focus:ring-[#B45309]/20'
              : 'border-[#4A4A4A] focus:border-[#3B6D11] focus:ring-[#3B6D11]/20'
          )}
        />
        {errors.name && (
          <p className="text-sm text-[#B45309] flex items-center gap-1">
            ⚠ {errors.name}
          </p>
        )}
      </div>

      {/* Land Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
          Land Size (acres) *
        </label>
        <input
          type="number"
          value={formData.landSize}
          onChange={(e) => handleChange('landSize', e.target.value)}
          placeholder="e.g., 10.5"
          min="0"
          step="0.1"
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 bg-[#0A0A0A] text-[#F5F1ED] placeholder:text-[#4A4A4A] focus:outline-none focus:ring-2 transition-all',
            errors.landSize
              ? 'border-[#B45309] focus:border-[#B45309] focus:ring-[#B45309]/20'
              : 'border-[#4A4A4A] focus:border-[#3B6D11] focus:ring-[#3B6D11]/20'
          )}
        />
        {errors.landSize && (
          <p className="text-sm text-[#B45309] flex items-center gap-1">
            ⚠ {errors.landSize}
          </p>
        )}
      </div>

      {/* Irrigation Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
          Irrigation Type *
        </label>
        <select
          value={formData.irrigationType}
          onChange={(e) => handleChange('irrigationType', e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border-2 border-[#4A4A4A] bg-[#0A0A0A] text-[#F5F1ED] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#3B6D11]/20 transition-all"
        >
          <option value="rainfed">Rainfed</option>
          <option value="canal">Canal</option>
          <option value="drip">Drip</option>
          <option value="sprinkler">Sprinkler</option>
        </select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
          Location (City/Region) *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g., Punjab, India"
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 bg-[#0A0A0A] text-[#F5F1ED] placeholder:text-[#4A4A4A] focus:outline-none focus:ring-2 transition-all',
            errors.location
              ? 'border-[#B45309] focus:border-[#B45309] focus:ring-[#B45309]/20'
              : 'border-[#4A4A4A] focus:border-[#3B6D11] focus:ring-[#3B6D11]/20'
          )}
        />
        {errors.location && (
          <p className="text-sm text-[#B45309] flex items-center gap-1">
            ⚠ {errors.location}
          </p>
        )}
      </div>

      {/* Coordinates (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
            Latitude
          </label>
          <input
            type="number"
            value={formData.latitude}
            onChange={(e) => handleChange('latitude', e.target.value)}
            placeholder="e.g., 28.7041"
            step="0.0001"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-[#4A4A4A] bg-[#0A0A0A] text-[#F5F1ED] placeholder:text-[#4A4A4A] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#3B6D11]/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
            Longitude
          </label>
          <input
            type="number"
            value={formData.longitude}
            onChange={(e) => handleChange('longitude', e.target.value)}
            placeholder="e.g., 77.1025"
            step="0.0001"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-[#4A4A4A] bg-[#0A0A0A] text-[#F5F1ED] placeholder:text-[#4A4A4A] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#3B6D11]/20 transition-all"
          />
        </div>
      </div>

      {submitStatus === 'success' && (
        <div className="rounded-lg bg-[#EEF4E8] border-l-4 border-[#3B6D11] p-4">
          <p className="text-sm text-[#1A1A1A] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#3B6D11]" />
            Farm saved successfully!
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-orange-50 border-l-4 border-[#B45309] p-4">
          <p className="text-sm text-[#1A1A1A] flex items-center gap-2">
            <AlertCircle size={16} className="text-[#B45309]" />
            Failed to save farm. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENT: SoilReadingsForm with Sliders
// ============================================
const SoilReadingsForm = ({ soilData, setSoilData, submitStatus }) => {
  const handleSliderChange = (field, value) => {
    setSoilData(prev => ({ ...prev, [field]: parseFloat(value) }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#8B7355]">
        Use the sliders to record soil nutrient levels. Green indicates optimal ranges.
      </p>

      {/* Nitrogen (N) */}
      <SoilSlider
        label="Nitrogen (N) Level"
        value={soilData.N}
        onChange={(val) => handleSliderChange('N', val)}
        min={0}
        max={100}
        unit="mg/kg"
        optimalRange={[40, 60]}
      />

      {/* Phosphorus (P) */}
      <SoilSlider
        label="Phosphorus (P) Level"
        value={soilData.P}
        onChange={(val) => handleSliderChange('P', val)}
        min={0}
        max={80}
        unit="mg/kg"
        optimalRange={[25, 45]}
      />

      {/* Potassium (K) */}
      <SoilSlider
        label="Potassium (K) Level"
        value={soilData.K}
        onChange={(val) => handleSliderChange('K', val)}
        min={0}
        max={120}
        unit="mg/kg"
        optimalRange={[35, 55]}
      />

      {/* pH Level */}
      <SoilSlider
        label="pH Level"
        value={soilData.pH}
        onChange={(val) => handleSliderChange('pH', val)}
        min={4.0}
        max={9.0}
        step={0.1}
        unit=""
        optimalRange={[6.0, 7.5]}
      />

      {/* Moisture */}
      <SoilSlider
        label="Moisture Percentage"
        value={soilData.moisture}
        onChange={(val) => handleSliderChange('moisture', val)}
        min={0}
        max={100}
        unit="%"
        optimalRange={[20, 40]}
      />

      {submitStatus === 'success' && (
        <div className="rounded-lg bg-[#EEF4E8] border-l-4 border-[#3B6D11] p-4">
          <p className="text-sm text-[#1A1A1A] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#3B6D11]" />
            Soil reading recorded successfully!
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-orange-50 border-l-4 border-[#B45309] p-4">
          <p className="text-sm text-[#1A1A1A] flex items-center gap-2">
            <AlertCircle size={16} className="text-[#B45309]" />
            Failed to submit reading. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENT: SoilSlider (Earthy Green with Optimal Range)
// ============================================
const SoilSlider = ({ label, value, onChange, min, max, step = 1, unit, optimalRange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;
  const isOptimal = value >= optimalRange[0] && value <= optimalRange[1];

  return (
    <div className="space-y-2">
      {/* Label ABOVE - Rule 6 */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#F5F1ED] uppercase tracking-wide">
          {label}
        </label>
        <span className={cn(
          'text-lg font-semibold px-3 py-1 rounded-lg',
          isOptimal ? 'text-[#3B6D11] bg-[#EEF4E8]/20' : 'text-[#F5F1ED] bg-[#1A1A1A]'
        )}>
          {value}{unit}
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
        {/* Optimal Range Indicator */}
        <div
          className="absolute h-full bg-[#3B6D11]/20"
          style={{
            left: `${((optimalRange[0] - min) / (max - min)) * 100}%`,
            width: `${((optimalRange[1] - optimalRange[0]) / (max - min)) * 100}%`
          }}
        />
        
        {/* Active Track */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-[#3B6D11] to-[#4A8515] rounded-full"
          style={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className="w-full h-2 appearance-none bg-transparent cursor-pointer relative -mt-2"
        style={{
          WebkitAppearance: 'none',
        }}
      />

      {/* Helper Text - Optimal Range */}
      <p className="text-xs text-[#8B7355]">
        Optimal: {optimalRange[0]}-{optimalRange[1]}{unit}
      </p>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B6D11;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(59, 109, 17, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(59, 109, 17, 0.4);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 109, 17, 0.5);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3B6D11;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(59, 109, 17, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(59, 109, 17, 0.4);
        }

        input[type="range"]::-moz-range-thumb:active {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 109, 17, 0.5);
        }
      `}</style>
    </div>
  );
};

// ============================================
// LOADING SKELETON - Rule 5
// ============================================
const FarmListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-xl bg-[#1A1A1A] p-4 border border-[#4A4A4A]/30 animate-pulse">
        <div className="h-5 bg-[#4A4A4A]/30 rounded w-3/4 mb-3" />
        <div className="h-4 bg-[#4A4A4A]/20 rounded w-1/2 mb-4" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-[#4A4A4A]/20 rounded" />
          <div className="h-12 bg-[#4A4A4A]/20 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// EMPTY STATE - Rule 5
// ============================================
const EmptyState = ({ onAddFarm }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-xl bg-[#1A1A1A] border-2 border-dashed border-[#4A4A4A]/50 p-12 text-center"
  >
    <Map size={64} className="mx-auto mb-4 text-[#8B7355]" />
    <h3 className="text-lg font-semibold text-[#F5F1ED] mb-2">
      No Farms Yet
    </h3>
    <p className="text-sm text-[#8B7355] mb-6 max-w-sm mx-auto">
      Add your first farm to start tracking soil health and managing your fields.
    </p>
    <Button
      onClick={onAddFarm}
      className="px-6 py-3 rounded-lg bg-[#3B6D11] text-white font-medium shadow-[0_2px_4px_rgba(59,109,17,0.2)] hover:bg-[#2D5309] active:scale-[0.98] transition-all duration-150 flex items-center gap-2 mx-auto"
    >
      <Plus size={18} />
      Add Your First Farm
    </Button>
  </motion.div>
);

export default FarmManagement;
