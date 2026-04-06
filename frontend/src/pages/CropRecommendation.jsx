import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Droplets, Sun, Thermometer, ChevronDown,
  CheckCircle2, Clock, TrendingUp, ArrowUpRight,
  Wheat, Sprout, FlaskConical, Star, Loader, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { cropsAPI } from '../services/api';

/* ── Constants ──────────────────────────────── */
const SEASONS = ['All', 'Kharif', 'Rabi', 'Zaid'];

const colorMap = {
  brand:   { badge: 'bg-brand/15 text-brand border-brand/20', ring: 'stroke-brand', bar: 'bg-brand', dot: 'bg-brand', card: 'border-brand/15 hover:border-brand/35' },
  harvest: { badge: 'bg-harvest/15 text-harvest border-harvest/20', ring: 'stroke-harvest', bar: 'bg-harvest', dot: 'bg-harvest', card: 'border-harvest/15 hover:border-harvest/35' },
  sky:     { badge: 'bg-sky/15 text-sky border-sky/20', ring: 'stroke-sky', bar: 'bg-sky', dot: 'bg-sky', card: 'border-sky/15 hover:border-sky/35' },
};

/* ── Helper Functions ──────────────────────────────── */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 'Kharif';
  if (month >= 10 && month <= 3) return 'Rabi';
  return 'Zaid';
}

function getLatinName(cropName) {
  const latinNames = {
    wheat: 'Triticum aestivum',
    rice: 'Oryza sativa',
    soybean: 'Glycine max',
    chickpea: 'Cicer arietinum',
    maize: 'Zea mays',
    mustard: 'Brassica napus',
    cotton: 'Gossypium hirsutum',
    sugarcane: 'Saccharum officinarum'
  };
  return latinNames[cropName.toLowerCase()] || 'Unknown species';
}

function getWaterRequirement(cropName) {
  const waterReqs = {
    wheat: 'Medium', rice: 'High', soybean: 'Medium', 
    chickpea: 'Low', maize: 'High', mustard: 'Low',
    cotton: 'High', sugarcane: 'Very High'
  };
  return waterReqs[cropName.toLowerCase()] || 'Medium';
}

function getWaterMm(cropName) {
  const waterMms = {
    wheat: '450–650 mm', rice: '1200–1500 mm', soybean: '450–700 mm',
    chickpea: '200–350 mm', maize: '500–800 mm', mustard: '200–300 mm',
    cotton: '700–1200 mm', sugarcane: '1500–2500 mm'
  };
  return waterMms[cropName.toLowerCase()] || '400–600 mm';
}

function getTemperatureRange(cropName) {
  const tempRanges = {
    wheat: '10–25°C', rice: '20–35°C', soybean: '20–30°C',
    chickpea: '20–30°C', maize: '21–27°C', mustard: '10–25°C',
    cotton: '21–30°C', sugarcane: '26–33°C'
  };
  return tempRanges[cropName.toLowerCase()] || '20–30°C';
}

function getDuration(cropName) {
  const durations = {
    wheat: '100–120 days', rice: '120–150 days', soybean: '90–110 days',
    chickpea: '90–100 days', maize: '70–90 days', mustard: '100–115 days',
    cotton: '180–200 days', sugarcane: '300–365 days'
  };
  return durations[cropName.toLowerCase()] || '90–120 days';
}

function getNutrientLevel(cropName, nutrient) {
  const nutrients = {
    wheat: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'Medium' },
    rice: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'High' },
    soybean: { nitrogen: 'Low', phosphorus: 'High', potassium: 'Medium' },
    chickpea: { nitrogen: 'Low', phosphorus: 'High', potassium: 'Low' },
    maize: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'High' },
    mustard: { nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'Low' }
  };
  return nutrients[cropName.toLowerCase()]?.[nutrient] || 'Medium';
}

function getTags(cropName) {
  const tags = {
    wheat: ['Staple', 'High Demand'],
    rice: ['Staple', 'Water Intensive'],
    soybean: ['Protein-Rich', 'Export Demand'],
    chickpea: ['Nitrogen-Fixing', 'Drought-Tolerant'],
    maize: ['High Yield', 'Fodder Use'],
    mustard: ['Oil Crop', 'Cold Resistant'],
    cotton: ['Cash Crop', 'Fiber'],
    sugarcane: ['Sugar Crop', 'Long Duration']
  };
  return tags[cropName.toLowerCase()] || ['Commercial Crop'];
}

function getColor(index) {
  const colors = ['brand', 'harvest', 'sky'];
  return colors[index % colors.length];
}

function getIcon(cropName) {
  const icons = {
    wheat: Wheat, rice: Wheat, soybean: Sprout,
    chickpea: Sprout, maize: Wheat, mustard: Leaf,
    cotton: Leaf, sugarcane: Wheat
  };
  return icons[cropName.toLowerCase()] || Leaf;
}

function MatchRing({ pct, color }) {
  const r = 22, circ = 2 * Math.PI * r;
  const c = colorMap[color];
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none"
          className={c.ring} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className={`text-xs font-bold z-10 ${c.ring.replace('stroke', 'text')}`}>{pct}%</span>
    </div>
  );
}

function NutrientBar({ label, level, color }) {
  const pct = level === 'Low' ? 28 : level === 'Medium' ? 58 : 90;
  const c = colorMap[color];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500">{label}</span>
        <span className="text-[10px] font-medium text-neutral-400">{level}</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${c.bar}`}
        />
      </div>
    </div>
  );
}

function CropCard({ crop, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = crop.icon;
  const c = colorMap[crop.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-3xl border transition-all duration-300 overflow-hidden ${c.card}`}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <MatchRing pct={crop.match} color={crop.color} />
            <div>
              <h3 className="font-display text-lg font-bold text-neutral-50">{crop.name}</h3>
              <p className="text-xs text-neutral-600 italic">{crop.latin}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${c.badge}`}>
              {crop.season}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {crop.tags.map(tag => (
            <span key={tag} className="text-[10px] font-medium text-neutral-500 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Droplets,   label: 'Water', value: crop.waterReq },
            { icon: Thermometer, label: 'Temp',  value: crop.temp },
            { icon: Clock,      label: 'Season', value: crop.duration },
          ].map(({ icon: Ic, label, value }) => (
            <div key={label} className="bg-white/[0.03] rounded-xl p-2 border border-white/[0.05]">
              <Ic className="w-3 h-3 text-neutral-600 mb-1" />
              <p className="text-[10px] text-neutral-600">{label}</p>
              <p className="text-xs font-semibold text-neutral-300">{value}</p>
            </div>
          ))}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-200 transition-colors w-full"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Hide' : 'View'} detailed analysis
        </button>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Left: nutrient needs */}
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Nutrient Requirements</p>
                  <div className="space-y-2.5">
                    <NutrientBar label="Nitrogen (N)" level={crop.nitrogen} color={crop.color} />
                    <NutrientBar label="Phosphorus (P)" level={crop.phosphorus} color={crop.color} />
                    <NutrientBar label="Potassium (K)" level={crop.potassium} color={crop.color} />
                  </div>
                </div>
                {/* Right: yield & profit */}
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Expected Returns</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Yield estimate</span>
                      <span className="text-xs font-bold text-neutral-200">{crop.yieldPerAcre}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Water requirement</span>
                      <span className="text-xs font-bold text-neutral-200">{crop.waterMm}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-500">Profit index</span>
                        <span className={`text-xs font-bold ${c.badge.split(' ').find(x => x.startsWith('text'))}`}>{crop.profitIndex}/100</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${crop.profitIndex}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full ${c.bar}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI tip */}
              <div className={`mt-4 p-3 rounded-xl border ${c.card} bg-white/[0.02]`}>
                <div className="flex items-start gap-2">
                  <Star className="w-3.5 h-3.5 text-lavender flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="font-semibold text-lavender">AI Tip: </span>
                    {crop.tip}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CropRecommendation() {
  const [activeSeason, setActiveSeason] = useState('All');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        // Try to get best investment crops first (has market intelligence)
        const response = await cropsAPI.getBestInvestment(1);
        
        if (response.data?.topInvestments) {
          // Transform market data to match our UI format
          const transformedCrops = response.data.topInvestments.map((item, index) => ({
            name: item.crop,
            latin: getLatinName(item.crop),
            match: item.score || 75,
            season: item.seasonal?.season || getCurrentSeason(),
            soilType: 'Loamy',
            waterReq: getWaterRequirement(item.crop),
            waterMm: getWaterMm(item.crop),
            temp: getTemperatureRange(item.crop),
            duration: getDuration(item.crop),
            yieldPerAcre: item.profitEstimate?.yield || '2-3 t/ha',
            nitrogen: getNutrientLevel(item.crop, 'nitrogen'),
            phosphorus: getNutrientLevel(item.crop, 'phosphorus'),
            potassium: getNutrientLevel(item.crop, 'potassium'),
            profitIndex: item.score || 75,
            tags: getTags(item.crop),
            color: getColor(index),
            icon: getIcon(item.crop),
            tip: `Market sentiment: ${item.marketSentiment}. ${item.profitEstimate?.roi ? `Expected ROI: ${item.profitEstimate.roi}` : ''}`
          }));
          setCrops(transformedCrops);
        } else {
          // Fallback to regular crops API
          const cropsResponse = await cropsAPI.getAll();
          setCrops(cropsResponse.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch crops:', err);
        setError(err.response?.data?.error || 'Failed to load crop recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 text-brand animate-spin" />
              <p className="text-neutral-400">Loading crop recommendations...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="w-8 h-8 text-alert" />
              <p className="text-neutral-400">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl text-brand hover:bg-brand/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const filtered = activeSeason === 'All'
    ? crops
    : crops.filter(c => c.season === activeSeason);

  const sorted = [...filtered].sort((a, b) => b.match - a.match);

  return (
    <Layout>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand/15 border border-brand/25 rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 text-brand" />
            </div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest">AI-Powered</p>
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-50">Crop Recommendations</h1>
          <p className="text-neutral-500 text-sm mt-1">Based on your soil profile (pH 6.8, Loamy), location & season</p>
        </motion.div>

        {/* Soil context banner */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-4 mb-6 flex items-center gap-4 border border-brand/10"
        >
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: 'Soil',       value: 'Loamy',       color: 'text-harvest' },
              { label: 'pH',         value: '6.8 (Ideal)', color: 'text-brand' },
              { label: 'Nitrogen',   value: 'Medium',      color: 'text-sky' },
              { label: 'Season',     value: 'Rabi 2025',   color: 'text-lavender' },
              { label: 'Region',     value: 'Pune, MH',    color: 'text-neutral-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-xs text-neutral-600">{label}:</span>
                <span className={`text-xs font-bold ${color}`}>{value}</span>
                <span className="text-neutral-800 mx-1 last:hidden">·</span>
              </div>
            ))}
          </div>
          <div className="ml-auto flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-brand" />
          </div>
        </motion.div>

        {/* Season filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="flex gap-2 mb-6"
        >
          {SEASONS.map(season => (
            <button
              key={season}
              onClick={() => setActiveSeason(season)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activeSeason === season
                  ? 'bg-brand/15 text-brand border-brand/30'
                  : 'text-neutral-500 border-white/[0.07] hover:text-neutral-300 hover:border-white/[0.12]'
              }`}
            >
              {season}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-500 bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.06]">
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
            {sorted.length} matches
          </div>
        </motion.div>

        {/* Crops grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSeason}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {sorted.map((crop, i) => (
              <CropCard key={crop.name} crop={crop} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </Layout>
  );
}
