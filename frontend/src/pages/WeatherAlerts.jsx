import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets,
  Thermometer, Eye, AlertTriangle, Bell, CheckCircle2,
  CloudLightning, Sunrise, Sunset, ArrowUp, ArrowDown,
  Gauge, Navigation, Zap, Compass
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import Layout from '../components/Layout';

/* ── API Integration ─────────────────────────────────── */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Weather Icon Helper ─────────────────────────────── */
const getWeatherIcon = (condition) => {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return Sun;
  } else if (conditionLower.includes('cloud') && !conditionLower.includes('rain')) {
    return Cloud;
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return CloudRain;
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return CloudLightning;
  } else if (conditionLower.includes('snow')) {
    return CloudSnow;
  } else if (conditionLower.includes('wind')) {
    return Wind;
  } else {
    return Cloud; // Default fallback
  }
};

/* ── Weather Color Helper ─────────────────────────────── */
const getWeatherColor = (condition, rainChance) => {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return 'harvest';
  } else if (conditionLower.includes('rain') || conditionLower.includes('storm') || rainChance > 60) {
    return 'sky';
  } else if (conditionLower.includes('thunder')) {
    return 'alert';
  } else {
    return 'neutral';
  }
};

/* ── Alert Icon Helper ─────────────────────────────────── */
const getAlertIcon = (type) => {
  const typeLower = type?.toLowerCase() || '';
  
  if (typeLower.includes('thunder') || typeLower.includes('storm')) {
    return CloudLightning;
  } else if (typeLower.includes('rain') || typeLower.includes('flood')) {
    return Droplets;
  } else if (typeLower.includes('wind')) {
    return Wind;
  } else if (typeLower.includes('temp') || typeLower.includes('heat')) {
    return Thermometer;
  } else if (typeLower.includes('sun') || typeLower.includes('clear')) {
    return Sun;
  } else {
    return AlertTriangle; // Default fallback
  }
};

const colorMap = {
  alert:   { bg: 'bg-alert/8 border-alert/20', icon: 'text-alert', title: 'text-alert', badge: 'bg-alert/15 text-alert' },
  sky:     { bg: 'bg-sky/8 border-sky/20',     icon: 'text-sky',   title: 'text-sky',   badge: 'bg-sky/15 text-sky' },
  brand:   { bg: 'bg-brand/8 border-brand/20', icon: 'text-brand', title: 'text-brand', badge: 'bg-brand/15 text-brand' },
  harvest: { bg: 'bg-harvest/8 border-harvest/20', icon: 'text-harvest', title: 'text-harvest', badge: 'bg-harvest/15 text-harvest' },
  neutral: { bg: 'bg-white/[0.03] border-white/[0.08]', icon: 'text-neutral-400', title: 'text-neutral-200', badge: 'bg-white/[0.06] text-neutral-400' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl border border-white/[0.1] px-3 py-2.5 text-xs shadow-xl">
      <p className="text-neutral-400 mb-1 font-semibold">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}{p.dataKey === 'temp' ? '°C' : p.dataKey === 'humidity' ? '%' : 'mm'}
        </p>
      ))}
    </div>
  );
};

export default function WeatherAlerts() {
  const [activeMetric, setActiveMetric] = useState('temp');
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: 18.52, lng: 73.85 }); // Default: Pune
  const [selectedForecast, setSelectedForecast] = useState(null);

  // Fetch weather data
  useEffect(() => {
    fetchWeatherData();
    // Set up periodic refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive weather data
      const response = await fetch(
        `${API_BASE_URL}/weather/comprehensive?lat=${location.lat}&lng=${location.lng}&days=7`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather data');
      
      const data = await response.json();
      
      setWeatherData(data);
      setHourlyData(data.hourly || []);
      const dailyData = data.daily || [];
      setForecastData(dailyData);
      setAlerts(data.alerts || []);
      
      // Set the first forecast item as selected by default
      if (dailyData.length > 0 && !selectedForecast) {
        setSelectedForecast(dailyData[0]);
      }
      
      setError(null);
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default location
        }
      );
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-alert mx-auto mb-4" />
            <p className="text-neutral-400">Failed to load weather data</p>
            <button 
              onClick={fetchWeatherData}
              className="mt-4 px-4 py-2 bg-brand text-neutral-50 rounded-lg hover:bg-brand/80"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedForecast) {
        setSelectedForecast(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedForecast]);

  const metricConfig = {
    temp:     { color: '#fb7185', label: 'Temperature (°C)', gradient: ['#fb7185', '#fb718520'] },
    humidity: { color: '#38bdf8', label: 'Humidity (%)',     gradient: ['#38bdf8', '#38bdf820'] },
    rain:     { color: '#22c55e', label: 'Rain (mm)',        gradient: ['#22c55e', '#22c55e20'] },
  };

  const mc = metricConfig[activeMetric];

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
            <div className="w-8 h-8 bg-sky/10 border border-sky/20 rounded-xl flex items-center justify-center">
              <Cloud className="w-4 h-4 text-sky" />
            </div>
            <p className="text-sky text-xs font-bold uppercase tracking-widest">Live Forecast</p>
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-50">Weather & Alerts</h1>
          <p className="text-neutral-500 text-sm mt-1">Pune, Maharashtra · Updated 10 min ago</p>
        </motion.div>

        {/* Current weather hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-6 mb-5 relative overflow-hidden border border-sky/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-brand/3 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-wrap items-start gap-6">
            {/* Main temp */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CloudRain className="w-16 h-16 text-sky" />
                </motion.div>
              </div>
              <div>
                <div className="flex items-start">
                  <span className="font-display text-6xl font-bold text-neutral-50">28</span>
                  <span className="text-2xl text-neutral-500 mt-2">°C</span>
                </div>
                <p className="text-sm font-medium text-sky mt-1">Partly Cloudy with showers</p>
                <p className="text-xs text-neutral-600 mt-0.5">Feels like 30°C · Pune, MH</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-white/[0.06] self-center" />

            {/* Detail stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 min-w-0">
              {[
                { icon: Droplets,   label: 'Humidity',   value: '68%',    color: 'text-sky' },
                { icon: Wind,       label: 'Wind',       value: '18 km/h', color: 'text-neutral-300' },
                { icon: Gauge,      label: 'Pressure',   value: '1012 hPa',color: 'text-neutral-300' },
                { icon: Eye,        label: 'Visibility', value: '8 km',   color: 'text-neutral-300' },
                { icon: Sunrise,    label: 'Sunrise',    value: '6:24 AM', color: 'text-harvest' },
                { icon: Sunset,     label: 'Sunset',     value: '6:48 PM', color: 'text-harvest' },
              ].map(({ icon: Ic, label, value, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.05]">
                  <Ic className={`w-4 h-4 ${color} flex-shrink-0`} />
                  <div>
                    <p className="text-[10px] text-neutral-600">{label}</p>
                    <p className="text-xs font-bold text-neutral-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Hourly chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-5 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-neutral-200">Today's Hourly Trend</p>
            <div className="flex gap-1.5">
              {Object.entries(metricConfig).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => setActiveMetric(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeMetric === key
                      ? 'border-current'
                      : 'border-white/[0.07] text-neutral-500 hover:text-neutral-300'
                  }`}
                  style={activeMetric === key ? { color, borderColor: color, backgroundColor: `${color}18` } : {}}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mc.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={mc.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#4a6b4c', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a6b4c', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey={activeMetric}
                  stroke={mc.color} strokeWidth={2.5}
                  fill="url(#chartGrad)"
                  dot={{ r: 0 }} activeDot={{ r: 4, fill: mc.color, strokeWidth: 0 }}
                  name={activeMetric}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 7-day forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-5 mb-5"
        >
          <p className="text-sm font-bold text-neutral-200 mb-4">7-Day Forecast</p>
          {forecastData.length > 0 ? (
            <div className="grid grid-cols-7 gap-2">
              {forecastData.map((forecast, i) => {
                const WeatherIcon = getWeatherIcon(forecast.condition);
                const forecastColor = forecast.color || getWeatherColor(forecast.condition, forecast.rainChance);
                const c = colorMap[forecastColor] || colorMap.neutral;
                return (
                  <motion.button
                    key={forecast.dayLabel || i}
                    onClick={() => setSelectedForecast(forecast)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-pointer ${i === 0 ? `${c.bg} border-opacity-100` : 'border-transparent hover:border-white/[0.08]'} ${selectedForecast?.dayLabel === forecast.dayLabel ? `${c.bg} border-opacity-100 ring-2 ring-offset-2 ring-offset-black ring-white/20` : ''}`}
                  >
                    <p className={`text-[10px] font-bold ${i === 0 || selectedForecast?.dayLabel === forecast.dayLabel ? c.icon : 'text-neutral-500'}`}>{forecast.dayLabel}</p>
                    <WeatherIcon className={`w-5 h-5 ${c.icon}`} />
                    <p className="text-xs font-bold text-neutral-100">{forecast.tempHigh}°</p>
                    <p className="text-[10px] text-neutral-600">{forecast.tempLow}°</p>
                    {forecast.rainChance > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5 text-sky" />
                        <span className="text-[9px] text-sky font-medium">{forecast.rainChance}%</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">No forecast data available</p>
            </div>
          )}
        </motion.div>

        {/* Farm alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-neutral-400" />
            <p className="text-sm font-bold text-neutral-200">Farm Alerts & Recommendations</p>
            <span className="ml-auto text-[10px] font-bold text-alert bg-alert/15 border border-alert/20 px-2 py-0.5 rounded-full">
              {alerts.length} active
            </span>
          </div>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => {
                const AlertIcon = alert.icon ? alert.icon : getAlertIcon(alert.type);
                const c = colorMap[alert.color] || colorMap.neutral;
                return (
                  <motion.div
                    key={alert.title || i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.09, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-2xl border p-4 ${c.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.badge}`}>
                        <AlertIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`text-sm font-bold ${c.title}`}>{alert.title}</p>
                          <span className="text-[10px] text-neutral-600">{alert.time || 'Recent'}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed mb-2">{alert.message}</p>
                        {alert.action && (
                          <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.07] w-fit">
                            <CheckCircle2 className={`w-3 h-3 ${c.icon} flex-shrink-0`} />
                            <span className="text-[11px] font-semibold text-neutral-300">{alert.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-500 text-sm">No active alerts</p>
                <p className="text-neutral-600 text-xs mt-1">All clear for farm operations</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Forecast Detail Modal */}
        {selectedForecast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedForecast(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 w-full max-w-md"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedForecast(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/[0.06]"
              >
                <span className="text-neutral-400 font-bold text-lg">✕</span>
              </motion.button>

              {/* Day Header */}
              <div className="mb-8">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Weather Forecast</p>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colorMap[selectedForecast.color || getWeatherColor(selectedForecast.condition, selectedForecast.rainChance)].bg} border ${colorMap[selectedForecast.color || getWeatherColor(selectedForecast.condition, selectedForecast.rainChance)].bg.split('border-')[1]?.split(' ')[0] ? `border-${colorMap[selectedForecast.color || getWeatherColor(selectedForecast.condition, selectedForecast.rainChance)].bg.split('border-')[1].split(' ')[0]}` : 'border-white/[0.1]'}`}>
                    {(() => {
                      const WeatherIcon = getWeatherIcon(selectedForecast.condition);
                      return <WeatherIcon className={`w-8 h-8 ${colorMap[selectedForecast.color || getWeatherColor(selectedForecast.condition, selectedForecast.rainChance)].icon}`} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-neutral-100">{selectedForecast.dayLabel}</h2>
                    <p className="text-sm text-neutral-400 mt-1">{selectedForecast.description || selectedForecast.condition}</p>
                  </div>
                </div>
              </div>

              {/* Temperature Section */}
              <div className="space-y-4 mb-8">
                <div className="glass-alt rounded-2xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-harvest" />
                      <span className="text-xs font-semibold text-neutral-300">Temperature</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">High</p>
                      <p className="text-3xl font-bold text-harvest">{selectedForecast.tempHigh}°C</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Low</p>
                      <p className="text-3xl font-bold text-sky">{selectedForecast.tempLow}°C</p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-xs text-neutral-500 mb-1">Humidity</p>
                      <p className="text-2xl font-bold text-sky">{selectedForecast.humidity || 65}%</p>
                    </div>
                  </div>
                </div>

                {/* Wind & UV Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-alt rounded-2xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-4 h-4 text-brand" style={{ transform: `rotate(${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].indexOf(selectedForecast.windDir || 'N') * 45}deg)` }} />
                      <span className="text-xs font-semibold text-neutral-300">Wind</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-100">{selectedForecast.wind || 12} km/h</p>
                    <p className="text-xs text-neutral-500 mt-1">{selectedForecast.windDir || 'N'}</p>
                  </div>
                  
                  <div className="glass-alt rounded-2xl p-4 border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-semibold text-neutral-300">UV Index</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-neutral-100">{selectedForecast.uv || 5}</p>
                      <div className="flex-1">
                        <div className="text-[10px] text-neutral-500">
                          {(selectedForecast.uv || 5) <= 2 ? 'Low' : (selectedForecast.uv || 5) <= 5 ? 'Moderate' : (selectedForecast.uv || 5) <= 7 ? 'High' : (selectedForecast.uv || 5) <= 10 ? 'Very High' : 'Extreme'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precipitation */}
                <div className="glass-alt rounded-2xl p-4 border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-4 h-4 text-sky" />
                    <span className="text-xs font-semibold text-neutral-300">Precipitation Chance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedForecast.rainChance || 0}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-sky to-sky/60"
                      />
                    </div>
                    <p className="text-lg font-bold text-sky tabular-nums">{selectedForecast.rainChance || 0}%</p>
                  </div>
                </div>

                {/* Farm Advisory */}
                <div className="glass-alt rounded-2xl p-4 border border-white/[0.06] bg-brand/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold text-brand">Smart Recommendation</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                    {(selectedForecast.rainChance || 0) > 70 
                      ? '🚫 High rain risk. Postpone pesticide spray applications. Focus on field drainage inspection and equipment maintenance.'
                      : (selectedForecast.rainChance || 0) > 40 
                      ? '⚠️ Moderate rain expected. Delay spray applications by 1-2 days. Monitor weather forecast closely.'
                      : (selectedForecast.rainChance || 0) > 20 
                      ? '✅ Good conditions. Suitable for most outdoor farm operations. Light spray possible in early morning.'
                      : '🌟 Excellent conditions! Ideal day for pesticide spraying, irrigation, and outdoor farm work.'}
                  </p>
                  {(selectedForecast.wind || 0) > 20 && (
                    <div className="text-xs bg-alert/20 border border-alert/40 rounded-lg p-2 text-alert mt-2">
                      ⚠️ High wind: {selectedForecast.wind || 0} km/h - Not ideal for spraying
                    </div>
                  )}
                  {(selectedForecast.humidity || 0) > 85 && (
                    <div className="text-xs bg-sky/20 border border-sky/40 rounded-lg p-2 text-sky mt-2">
                      💧 High humidity - Disease risk increases. Apply fungicide if planned.
                    </div>
                  )}
                  {(selectedForecast.uv || 0) > 7 && (
                    <div className="text-xs bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-2 text-yellow-300 mt-2">
                      ☀️ High UV index - Use sun protection, schedule outdoor work early/late
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedForecast(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-semibold transition-colors text-sm"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    alert(`✅ Scheduled: Farm activity for ${selectedForecast.dayLabel}\n\n📅 Recommendation: ${
                      (selectedForecast.rainChance || 0) > 70 ? 'Equipment maintenance' :
                      (selectedForecast.rainChance || 0) > 40 ? 'Monitor conditions' :
                      (selectedForecast.rainChance || 0) > 20 ? 'Light operations' :
                      'Pesticide spray + irrigation'
                    }\n\n🌤️ Conditions: ${selectedForecast.description || selectedForecast.condition}`);
                    setSelectedForecast(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-brand to-brand/80 text-black font-semibold hover:shadow-lg hover:shadow-brand/40 transition-all text-sm"
                >
                  Schedule Activity
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </Layout>
  );

}
