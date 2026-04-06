import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, TrendingUp, Zap, BarChart3, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Sprout, Calendar, Target
} from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';

export default function CropRotationPlanner() {
  const [years, setYears] = useState(3);
  const [numCrops, setNumCrops] = useState(3);
  const [soilType, setSoilType] = useState('loam');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(0);
  const [error, setError] = useState(null);
  const [cropDatabase, setCropDatabase] = useState({});

  // Fetch crop database
  React.useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/crop-rotation/database', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCropDatabase(response.data.data);
      } catch (err) {
        console.error('Failed to fetch crop database:', err);
      }
    };
    fetchDatabase();
  }, []);

  // Optimize crop rotation
  const handleOptimize = async () => {
    if (years < 2 || years > 5 || numCrops < 1 || numCrops > 4) {
      setError('Invalid parameters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/crop-rotation/optimize',
        { years, num_crops: numCrops, soil_type: soilType },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setResults(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to optimize rotation');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Crop Rotation Planner</h1>
          </div>
          <p className="text-neutral-400">AI-powered genetic algorithm for sustainable multi-year crop planning</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-white/10 p-6 mb-8 backdrop-blur-md"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Optimization Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Years */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                <Calendar className="inline w-4 h-4 mr-2" />
                Planning Period (Years)
              </label>
              <select
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
              >
                {[2, 3, 4, 5].map(y => (
                  <option key={y} value={y}>{y} years</option>
                ))}
              </select>
            </div>

            {/* Number of Crops */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                <Leaf className="inline w-4 h-4 mr-2" />
                Crops Per Year
              </label>
              <select
                value={numCrops}
                onChange={(e) => setNumCrops(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
              >
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} crop{n !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                <Target className="inline w-4 h-4 mr-2" />
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
              >
                <option value="loam">Loam (Balanced)</option>
                <option value="clay">Clay (Dense)</option>
                <option value="sandy">Sandy (Draining)</option>
              </select>
            </div>

            {/* Optimize Button */}
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOptimize}
                disabled={loading}
                className="w-full px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Optimize
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3 text-red-300"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Top Rotation Plans</h2>

              {results.map((plan, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className="glass rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md"
                >
                  {/* Plan Header */}
                  <motion.button
                    onClick={() => setExpandedPlan(expandedPlan === idx ? -1 : idx)}
                    className="w-full p-6 hover:bg-white/5 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold">{idx + 1}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white text-lg">
                          {plan.recommendation}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          Diversity: {plan.diversity} crops | Overall Score: {plan.overall_score.toFixed(1)}/100
                        </p>
                      </div>
                    </div>

                    {expandedPlan === idx ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    )}
                  </motion.button>

                  {/* Detailed View */}
                  <AnimatePresence>
                    {expandedPlan === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10 overflow-hidden"
                      >
                        <div className="p-6 space-y-6">
                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            <MetricCard
                              icon={TrendingUp}
                              label="Yield Score"
                              value={plan.yield_score.toFixed(1)}
                              color="emerald"
                            />
                            <MetricCard
                              icon={Leaf}
                              label="Soil Health"
                              value={plan.soil_health_score.toFixed(1)}
                              color="cyan"
                            />
                            <MetricCard
                              icon={BarChart3}
                              label="ROI Score"
                              value={plan.roi_score.toFixed(1)}
                              color="amber"
                            />
                          </div>

                          {/* Yearly Breakdown */}
                          <div>
                            <h3 className="font-semibold text-white mb-4">Rotation Schedule</h3>
                            <div className="space-y-3">
                              {plan.yearly_plan.map((yearCrops, yearIdx) => (
                                <YearCard
                                  key={yearIdx}
                                  year={yearIdx + 1}
                                  crops={yearCrops}
                                  cropDatabase={cropDatabase}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Action Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Implement This Plan
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl border border-white/10 p-12 text-center backdrop-blur-md"
          >
            <Sprout className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">
              Click "Optimize" to generate AI-powered crop rotation plans
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colorClass = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  }[color];

  return (
    <div className={`${colorClass} border rounded-lg p-3 text-center`}>
      <Icon className="w-5 h-5 mx-auto mb-2" />
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function YearCard({ year, crops, cropDatabase }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <p className="font-semibold text-neutral-300 mb-3">
        <Calendar className="inline w-4 h-4 mr-2" />
        Year {year}
      </p>
      <div className="flex flex-wrap gap-2">
        {crops.map((crop, idx) => {
          const cropData = cropDatabase[crop];
          return (
            <div
              key={idx}
              className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <Leaf className="w-3 h-3" />
              {crop}
              {cropData && (
                <span className="text-xs text-emerald-400/70">
                  (Yield: {cropData.yield}%)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
