import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { animate } from 'motion';
import {
  Thermometer, Droplets, FlaskConical, Sprout, MessageCircle,
  CloudSun, Leaf, ChevronRight, AlertTriangle, CheckCircle2,
  Wind, Sun, ArrowUpRight, Zap, CalendarDays, TrendingUp,
  Wheat, Clock, Camera, Upload, X
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Layout from '../components/Layout';
import { farmsAPI } from '../services/api';

/* ── Icon mapping for alerts ─────────────────────────────────── */
const iconMapping = {
  CloudRain: CloudSun,
  AlertTriangle: AlertTriangle,
  Droplets: Droplets,
  CheckCircle2: CheckCircle2,
  TrendingUp: TrendingUp,
  Zap: Zap,
};

/* ── Real-time WebSocket connection ─────────────────────────────────── */
class RealTimeUpdates {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = `ws://localhost:5000/ws?token=${localStorage.getItem('token')}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('🔗 Real-time connection established');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyCallbacks(data.type, data.payload);
    };

    this.socket.onclose = () => {
      console.log('🔌 Real-time connection closed');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnects})`);
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  subscribe(type, callback) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type).add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get(type)?.delete(callback);
    };
  }

  notifyCallbacks(type, payload) {
    const callbacks = this.callbacks.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Global real-time instance
const realTimeUpdates = new RealTimeUpdates();

const QUICK_ACTIONS = [
  { label: 'Scan Plant', icon: Camera,       action: 'scan',   color: 'brand',    bg: 'bg-brand/10 border-brand/20 hover:bg-brand/18',            text: 'text-brand' },
  { label: 'AI Chat',    icon: MessageCircle, path: '/chat',    color: 'lavender', bg: 'bg-lavender/10 border-lavender/20 hover:bg-lavender/18', text: 'text-lavender' },
  { label: 'Weather',    icon: CloudSun,      path: '/weather', color: 'sky',      bg: 'bg-sky/10 border-sky/20 hover:bg-sky/18',                 text: 'text-sky' },
  { label: 'Crops',      icon: Leaf,          path: '/crops',   color: 'brand',    bg: 'bg-brand/10 border-brand/20 hover:bg-brand/18',            text: 'text-brand' },
  { label: 'Soil',       icon: FlaskConical,  path: '/soil',    color: 'harvest',  bg: 'bg-harvest/10 border-harvest/20 hover:bg-harvest/18',      text: 'text-harvest' },
];

const colorAlertMap = {
  harvest: 'border-harvest/20 bg-harvest/8 text-harvest',
  sky:     'border-sky/20 bg-sky/8 text-sky',
  brand:   'border-brand/20 bg-brand/8 text-brand',
};

function AnimatedCounter({ target, duration = 1.6, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctrl = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v) + suffix; },
    });
    return () => ctrl.stop();
  }, [target, duration, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function FarmHealthRing({ score = 84 }) {
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#fbbf24' : '#fb7185';
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-2xl font-bold text-neutral-50 font-display" style={{ color }}>
          <AnimatedCounter target={score} suffix="%" />
        </span>
        <span className="text-[10px] text-neutral-500 font-medium mt-0.5">Health</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [now, setNow] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Guard: ensure user is authenticated
  React.useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    // Connect to real-time updates
    realTimeUpdates.connect();
    
    // Subscribe to real-time dashboard updates
    const unsubscribeAlerts = realTimeUpdates.subscribe('new_alert', (alert) => {
      console.log('🔔 New alert received:', alert);
      setDashboardData(prev => ({
        ...prev,
        alerts: {
          ...prev?.alerts,
          unreadCount: (prev?.alerts?.unreadCount || 0) + 1,
          recent: [alert, ...(prev?.alerts?.recent || []).slice(0, 9)]
        }
      }));
    });

    const unsubscribeWeather = realTimeUpdates.subscribe('weather_update', (weather) => {
      console.log('🌤️ Weather update received:', weather);
      setDashboardData(prev => ({
        ...prev,
        weather: weather
      }));
    });

    const unsubscribeSoil = realTimeUpdates.subscribe('soil_update', (soilData) => {
      console.log('🌱 Soil update received:', soilData);
      setDashboardData(prev => ({
        ...prev,
        soil: soilData.soil,
        healthScore: soilData.healthScore
      }));
    });

    return () => {
      clearInterval(interval);
      unsubscribeAlerts();
      unsubscribeWeather();
      unsubscribeSoil();
      realTimeUpdates.disconnect();
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  // Get alerts from dashboard data
  const alerts = dashboardData?.alerts?.recent || [];
  const alertCount = alerts.length;
  const unreadCount = dashboardData?.alerts?.unreadCount || 0;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const spring = { type: 'spring', stiffness: 80, damping: 16 };
  const stagger = (i) => ({ delay: 0.08 * i, ...spring });

  // Upload handlers
  const handleImageProcessing = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dragZoneRef.current?.classList.add('border-brand', 'bg-brand/10');
  };

  const handleDragLeave = () => {
    dragZoneRef.current?.classList.remove('border-brand', 'bg-brand/10');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragZoneRef.current?.classList.remove('border-brand', 'bg-brand/10');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageProcessing(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length > 0) {
      handleImageProcessing(e.target.files[0]);
    }
  };

  const handleCameraCapture = (e) => {
    if (e.target.files?.length > 0) {
      handleImageProcessing(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadPreview) return;
    setIsAnalyzing(true);
    // Simulate analysis - in real app, send to ML service
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/scanner');
      setShowUploadModal(false);
    }, 1500);
  };

  const clearPreview = () => {
    setUploadPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Layout>
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">

        {/* ── Hero greeting ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">{dateStr}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-50 leading-tight">
                {getGreeting()},<br />
                <span className="gradient-text-brand">{user.name || 'Farmer'}</span>
              </h1>
              <p className="text-neutral-400 text-sm mt-2">Your farm is looking healthy today.</p>
            </div>
            <div className="flex flex-col items-end gap-1 mt-1">
              <span className="text-2xl font-bold text-neutral-50 font-display tabular-nums">{timeStr}</span>
              <span className="text-xs text-neutral-500">Pune, MH</span>
            </div>
          </div>
        </motion.div>

        {/* ── Farm health + weather hero card ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-5 md:p-6 mb-5 relative overflow-hidden"
        >
          {/* Glow accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-harvest/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">

            {/* Farm health ring */}
            <div className="flex items-center gap-5">
              <FarmHealthRing score={84} />
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Farm Health</p>
                <p className="text-lg font-bold text-neutral-50">Excellent</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {alertCount} minor alerts · 
                  <button 
                    onClick={() => setShowAllAlerts(true)}
                    className="text-brand hover:text-brand/80 cursor-pointer font-semibold ml-1 transition-colors"
                  >
                    View all
                  </button>
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="px-2 py-0.5 bg-brand/15 text-brand text-xs font-semibold rounded-full border border-brand/20">Wheat</span>
                  <span className="px-2 py-0.5 bg-sky/10 text-sky text-xs font-semibold rounded-full border border-sky/15">Flowering</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-24 bg-white/[0.07]" />

            {/* Weather quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-0">
              {[
                { icon: Thermometer, label: 'Temp',     value: '28°C', sub: 'Feels 30°', color: 'text-alert' },
                { icon: Droplets,    label: 'Humidity',  value: '68%',  sub: 'Good range', color: 'text-sky' },
                { icon: Wind,        label: 'Wind',      value: '12 km/h', sub: 'NE breeze', color: 'text-neutral-300' },
                { icon: Sun,         label: 'UV Index',  value: '7',    sub: 'High', color: 'text-harvest' },
              ].map(({ icon: Icon, label, value, sub, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, ...spring }}
                  className="bg-white/[0.04] rounded-2xl p-3 border border-white/[0.06]"
                >
                  <Icon className={`w-4 h-4 ${color} mb-2`} />
                  <p className="text-lg font-bold text-neutral-50">{value}</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">{label}</p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Quick actions ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-4 gap-3 mb-5"
        >
          {QUICK_ACTIONS.map(({ label, icon: Icon, path, action, bg, text }, i) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, ...spring }}
              onClick={() => action === 'scan' ? setShowUploadModal(true) : navigate(path)}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all ${bg}`}
            >
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${text}`} />
              <span className={`text-[11px] md:text-xs font-semibold ${text}`}>{label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* ── Two column: AI tip + Alerts ─────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">

          {/* AI Daily Insight */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-5 relative overflow-hidden border border-lavender/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lavender/6 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-lavender/15 border border-lavender/25 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-lavender" />
                </div>
                <div>
                  <p className="text-xs font-bold text-lavender uppercase tracking-wider">AI Insight</p>
                  <p className="text-[10px] text-neutral-600">Updated just now</p>
                </div>
                <button onClick={() => navigate('/chat')} className="ml-auto text-neutral-600 hover:text-lavender transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed">
                Your wheat is in peak flowering stage. Ensure soil moisture stays above 40%.
                A light irrigation tomorrow morning will maximize grain set yield by an estimated{' '}
                <span className="text-brand font-semibold">12–15%</span>.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => navigate('/chat')}
                  className="text-xs font-semibold text-lavender flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ask AI for details <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-neutral-200">Recent Alerts</p>
              <span className="text-[10px] font-semibold text-alert bg-alert/10 border border-alert/20 px-2 py-0.5 rounded-full">
                {alertCount} new
              </span>
            </div>
            <div className="space-y-2 mb-3">
              {alerts.slice(0, 2).map(({ id, icon, text, time, color }, i) => {
                const IconComponent = iconMapping[icon] || AlertTriangle;
                return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${colorAlertMap[color]}`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-200 leading-snug">{text}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5">{time}</p>
                  </div>
                </motion.div>
                );
              })}
            </div>
            {alertCount > 2 && (
              <button
                onClick={() => setShowAllAlerts(true)}
                className="w-full text-center text-xs font-semibold text-brand hover:text-brand/80 py-2 transition-colors"
              >
                View all {alertCount} alerts
              </button>
            )}
          </motion.div>
        </div>

        {/* ── Crop overview + Upcoming tasks ──────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Active crop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-5 relative overflow-hidden cursor-pointer group"
            onClick={() => navigate('/crops')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 text-brand/8 group-hover:text-brand/14 transition-colors duration-500">
              <Wheat className="w-28 h-28" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand/15 border border-brand/25 rounded-xl flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-brand" />
                </div>
                <p className="text-sm font-bold text-neutral-200">Active Crop</p>
                <ChevronRight className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-brand group-hover:translate-x-1 transition-all" />
              </div>
              <p className="font-display text-2xl font-bold text-neutral-50 mb-1">Wheat</p>
              <p className="text-xs text-neutral-500 mb-4">Triticum aestivum · Field A (4.2 ha)</p>
              {/* Growth progress */}
              <div className="space-y-2">
                {[
                  { stage: 'Germination', pct: 100, done: true },
                  { stage: 'Tillering',   pct: 100, done: true },
                  { stage: 'Flowering',   pct: 65,  done: false },
                  { stage: 'Harvest',     pct: 0,   done: false },
                ].map(({ stage, pct, done }) => (
                  <div key={stage} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-brand' : pct > 0 ? 'bg-harvest animate-pulse' : 'bg-white/10'}`} />
                    <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${done ? 'bg-brand' : pct > 0 ? 'bg-harvest' : 'bg-transparent'}`}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 w-16">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-harvest/10 border border-harvest/20 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-harvest" />
              </div>
              <p className="text-sm font-bold text-neutral-200">Upcoming Tasks</p>
            </div>
            <div className="space-y-3">
              {[
                { task: 'Apply Urea fertilizer',       due: 'Tomorrow',   priority: 'high',   icon: TrendingUp },
                { task: 'Pest scouting – Field B',      due: 'In 2 days',  priority: 'medium', icon: Leaf },
                { task: 'Soil moisture check – All',    due: 'In 3 days',  priority: 'low',    icon: Droplets },
                { task: 'Harvest readiness assessment', due: 'In 10 days', priority: 'low',    icon: Wheat },
              ].map(({ task, due, priority, icon: Icon }, i) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-colors group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    priority === 'high' ? 'bg-alert/10 border border-alert/20' :
                    priority === 'medium' ? 'bg-harvest/10 border border-harvest/20' :
                    'bg-brand/8 border border-brand/15'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                      priority === 'high' ? 'text-alert' :
                      priority === 'medium' ? 'text-harvest' :
                      'text-brand'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-200 truncate">{task}</p>
                    <p className="text-[10px] text-neutral-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {due}
                    </p>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    priority === 'high' ? 'bg-alert' :
                    priority === 'medium' ? 'bg-harvest' :
                    'bg-brand/50'
                  }`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── Upload Modal ──────────────────────────── */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowUploadModal(false);
              clearPreview();
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-6 md:p-8 w-full max-w-md mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-neutral-50">Scan Your Crop</h2>
                  <p className="text-sm text-neutral-400 mt-1">Upload or capture an image for instant health analysis</p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    clearPreview();
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!uploadPreview ? (
                <div className="space-y-3">
                  {/* Drag & Drop Zone */}
                  <div
                    ref={dragZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-brand/50 transition-colors"
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-brand/60" />
                    <p className="text-sm font-medium text-neutral-200">Drag crop image here</p>
                    <p className="text-xs text-neutral-400 mt-1">or use buttons below</p>
                  </div>

                  {/* File & Camera Inputs (hidden) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand/10 border border-brand/20 hover:bg-brand/15 text-brand font-semibold transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky/10 border border-sky/20 hover:bg-sky/15 text-sky font-semibold transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      Capture
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview Image */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/20 aspect-square flex items-center justify-center">
                    <img
                      src={uploadPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={clearPreview}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={clearPreview}
                      className="py-3 px-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 text-neutral-200 font-semibold transition-all"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="py-3 px-4 rounded-xl bg-brand text-black font-semibold hover:bg-brand/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-transparent border-t-black rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── All Alerts Modal ──────────────────────────── */}
      <AnimatePresence>
        {showAllAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAllAlerts(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <h2 className="text-xl font-bold text-neutral-50">Farm Alerts</h2>
                <button
                  onClick={() => setShowAllAlerts(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {alertCount > 0 ? (
                    alerts.map(({ id, icon, text, time, color, type }) => {
                      const IconComponent = iconMapping[icon] || AlertTriangle;
                      return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-4 p-4 rounded-2xl border ${colorAlertMap[color]}`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-neutral-50">{text}</p>
                          <p className="text-xs text-neutral-500 mt-1">{time}</p>
                          {type === 'warning' && (
                            <button className="text-xs text-brand hover:text-brand/80 font-semibold mt-2 transition-colors">
                              Take action →
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[10px] font-semibold text-neutral-500 uppercase bg-white/5 px-2 py-1 rounded-full">
                            {type}
                          </span>
                        </div>
                      </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-brand/40 mx-auto mb-4" />
                      <p className="text-neutral-400">No alerts at the moment</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] p-6 bg-white/[0.02]">
                <button
                  onClick={() => setShowAllAlerts(false)}
                  className="w-full py-3 rounded-xl bg-brand text-black font-semibold hover:bg-brand/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  );
}