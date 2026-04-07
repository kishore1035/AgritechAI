import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, TrendingUp, AlertTriangle, Droplets, 
  Cloud, Sun, Wind, MessageCircle, X, Minimize2, 
  Maximize2, Send, ChevronRight, Activity, 
  ThermometerSun, Eye, Calendar
} from 'lucide-react';
import { tastePatterns, AGRITECH_COLORS, layoutPatterns } from '../tasteSkillConfig';
import { cn } from '../utils/cn';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = ({ onAlert }) => {
  const { t } = useTranslation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [soilHealth, setSoilHealth] = useState(null);
  const [yieldPrediction, setYieldPrediction] = useState(null);
  const [diseaseRisk, setDiseaseRisk] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch all dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch data in parallel with realistic farm data
      const [soil, yieldData, disease, market, weather, recommendations] = await Promise.allSettled([
        fetchSoilHealth(),
        fetchYieldPrediction(),
        fetchDiseaseRisk(),
        fetchMarketData(),
        fetchWeatherForecast(),
        fetchCropRecommendations()
      ]);

      // Handle settled promises
      if (soil.status === 'fulfilled') setSoilHealth(soil.value);
      else setErrors(prev => ({ ...prev, soil: soil.reason }));

      if (yieldData.status === 'fulfilled') setYieldPrediction(yieldData.value);
      else setErrors(prev => ({ ...prev, yield: yieldData.reason }));

      if (disease.status === 'fulfilled') setDiseaseRisk(disease.value);
      else setErrors(prev => ({ ...prev, disease: disease.reason }));

      if (market.status === 'fulfilled') setMarketData(market.value);
      else setErrors(prev => ({ ...prev, market: market.reason }));

      if (weather.status === 'fulfilled') setWeatherForecast(weather.value);
      else setErrors(prev => ({ ...prev, weather: weather.reason }));

      if (recommendations.status === 'fulfilled') setCropRecommendations(recommendations.value);
      else setErrors(prev => ({ ...prev, recommendations: recommendations.reason }));

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }

    // Simulate fetching active alerts
    fetchActiveAlerts();
  };

  // API fetch functions
  const fetchSoilHealth = async () => {
    const response = await fetch(`${API_BASE_URL}/predictions/soil-health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nitrogen: 48,
        phosphorus: 38,
        potassium: 62,
        pH: 6.7,
        moisture: 58,
        organicMatter: 3.2
      })
    });
    if (!response.ok) throw new Error('Failed to fetch soil health');
    const data = await response.json();
    return data.data;
  };

  const fetchYieldPrediction = async () => {
    const response = await fetch(`${API_BASE_URL}/predictions/crop-yield`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropName: 'rice',
        area: 2.5,
        nitrogen: 48,
        phosphorus: 38,
        potassium: 62,
        rainfall: 820,
        temperature: 26
      })
    });
    if (!response.ok) throw new Error('Failed to fetch yield prediction');
    const data = await response.json();
    return data.data;
  };

  const fetchDiseaseRisk = async () => {
    const response = await fetch(`${API_BASE_URL}/predictions/disease-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropName: 'rice',
        temperature: 26,
        humidity: 68,
        rainfall: 120
      })
    });
    if (!response.ok) throw new Error('Failed to fetch disease risk');
    const data = await response.json();
    return data.data;
  };

  const fetchMarketData = async () => {
    // Simulated market data (endpoint may not exist yet)
    return {
      crop: 'Rice',
      price: 2850,
      unit: '₹/quintal',
      change: '+3.2%',
      trend: 'up',
      marketScore: 78,
      demandLevel: 'High'
    };
  };

  const fetchWeatherForecast = async () => {
    const response = await fetch(`${API_BASE_URL}/weather/data/forecast?location=Bangalore`);
    if (!response.ok) throw new Error('Failed to fetch weather forecast');
    const data = await response.json();
    return data.data;
  };

  const fetchCropRecommendations = async () => {
    const response = await fetch(`${API_BASE_URL}/predictions/recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmArea: 2.5,
        soilData: {
          nitrogen: 48,
          phosphorus: 38,
          potassium: 62,
          pH: 6.7
        },
        weatherData: {
          temperature: 26,
          rainfall: 820,
          humidity: 68
        },
        cropPreferences: ['rice', 'wheat', 'cotton']
      })
    });
    if (!response.ok) throw new Error('Failed to fetch crop recommendations');
    const data = await response.json();
    return data.data;
  };

  const fetchActiveAlerts = () => {
    // Simulated alerts based on data conditions
    const activeAlerts = [
      {
        id: 1,
        type: 'warning',
        priority: 'high',
        title: 'Moisture Level Alert',
        message: 'Field moisture at 58% - consider irrigation within 2 days',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actionable: true
      },
      {
        id: 2,
        type: 'info',
        priority: 'medium',
        title: 'Weather Update',
        message: 'Rain expected in 3 days - postpone fertilizer application',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        actionable: false
      }
    ];
    setAlerts(activeAlerts);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          context: { soilHealth, yieldPrediction, diseaseRisk }
        })
      });

      if (!response.ok) throw new Error('Chat service unavailable');

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response || 'I can help with farming advice!' };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I am currently offline. Please try again later.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const lower = condition?.toLowerCase() || '';
    if (lower.includes('sun') || lower.includes('clear')) return <Sun className="text-amber-500" size={24} />;
    if (lower.includes('cloud')) return <Cloud className="text-stone-400" size={24} />;
    if (lower.includes('rain')) return <Droplets className="text-blue-500" size={24} />;
    return <Cloud className="text-stone-400" size={24} />;
  };

  const getRiskColor = (level) => {
    const lower = level?.toLowerCase() || '';
    if (lower.includes('low')) return AGRITECH_COLORS.semantic.success;
    if (lower.includes('moderate') || lower.includes('medium')) return AGRITECH_COLORS.semantic.warning;
    return AGRITECH_COLORS.semantic.error;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(layoutPatterns.mainContent, "min-h-screen bg-neutral-950")}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-800 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-neutral-800 rounded w-96"></div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-neutral-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className={cn(layoutPatterns.mainContent)}>
        {/* Asymmetric Header - Left-aligned per DESIGN_VARIANCE=7 */}
        <div className="mb-4 space-y-1">
          <h1 className={cn(tastePatterns.typography.h2, "text-neutral-100")}>
            {t('dashboard.welcome') || 'Farm Dashboard'}
          </h1>
          <p className={cn(tastePatterns.typography.body, "text-neutral-400")}>
            Real-time insights for smarter farming decisions
          </p>
        </div>

        {/* Asymmetric Grid Layout - DESIGN_VARIANCE=7 */}
        <div className="grid grid-cols-12 gap-2.5 lg:gap-3">
          
          {/* Left Column - Primary Metrics (spans 8 cols on large screens) */}
          <div className="col-span-12 lg:col-span-8 space-y-2.5 lg:space-y-3">
            
            {/* Top Row: Soil Health + Yield Prediction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 lg:gap-3">
              
              {/* Soil Health Card */}
              <SoilHealthCard 
                data={soilHealth} 
                error={errors.soil}
                onRetry={() => fetchSoilHealth().then(setSoilHealth)}
              />

              {/* Yield Prediction Card */}
              <YieldPredictionCard 
                data={yieldPrediction}
                error={errors.yield}
                onRetry={() => fetchYieldPrediction().then(setYieldPrediction)}
              />
            </div>

            {/* Weather Forecast - Full Width */}
            <WeatherForecastSection 
              data={weatherForecast}
              error={errors.weather}
              onRetry={() => fetchWeatherForecast().then(setWeatherForecast)}
            />

            {/* Crop Recommendations */}
            <CropRecommendationsCard 
              data={cropRecommendations}
              error={errors.recommendations}
              onRetry={() => fetchCropRecommendations().then(setCropRecommendations)}
            />
          </div>

          {/* Right Column - Secondary Metrics (spans 4 cols on large screens) */}
          <div className="col-span-12 lg:col-span-4 space-y-2.5 lg:space-y-3">
            
            {/* Disease Risk Indicator */}
            <DiseaseRiskCard 
              data={diseaseRisk}
              error={errors.disease}
              onRetry={() => fetchDiseaseRisk().then(setDiseaseRisk)}
            />

            {/* Market Score Card */}
            <MarketScoreCard 
              data={marketData}
              error={errors.market}
              onRetry={() => setMarketData(fetchMarketData())}
            />

            {/* Active Alerts */}
            <ActiveAlertsSection alerts={alerts} />
          </div>
        </div>

        {/* AI Chat Widget - Bottom Right */}
        <ChatWidget
          isOpen={chatOpen}
          isMinimized={chatMinimized}
          messages={chatMessages}
          input={chatInput}
          loading={chatLoading}
          onToggle={() => setChatOpen(!chatOpen)}
          onMinimize={() => setChatMinimized(!chatMinimized)}
          onInputChange={setChatInput}
          onSend={sendChatMessage}
        />
      </div>
    </div>
  );
};

// Soil Health Card Component
const SoilHealthCard = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Soil Health" 
        message="Unable to load soil data" 
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-40 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 75) return AGRITECH_COLORS.semantic.success;
    if (score >= 50) return AGRITECH_COLORS.semantic.warning;
    return AGRITECH_COLORS.semantic.error;
  };

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "transform transition-all duration-300 hover:scale-[1.02]",
        "stagger-delay-1"
      )}
      style={{ animationDelay: '0.1s' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-success/15">
            <Leaf className="text-[#3B6D11]" size={24} />
          </div>
          <div>
            <h3 className={cn(tastePatterns.typography.label, "text-neutral-100 text-xs")}>
              Soil Health Score
            </h3>
            <p className="text-3xl font-bold mt-1" style={{ color: getHealthColor(data.healthScore) }}>
              {data.healthScore}
              <span className="text-lg text-neutral-500 ml-1">/100</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center py-1.5 border-t border-neutral-800">
          <span className="text-sm text-neutral-300">Rating</span>
          <span className="text-sm font-semibold text-neutral-100">{data.rating}</span>
        </div>
        
        {data.improvements && data.improvements.length > 0 && (
          <div className="pt-2 border-t border-neutral-800">
            <p className="text-xs font-medium text-neutral-400 mb-2">Key Improvements:</p>
            <ul className="space-y-1">
              {data.improvements.slice(0, 2).map((improvement, idx) => (
                <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <ChevronRight size={14} className="text-[#3B6D11] mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Yield Prediction Card Component
const YieldPredictionCard = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Yield Prediction" 
        message="Unable to load yield data" 
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-40 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  const confidencePercent = Math.round((data.confidence || 0) * 100);

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "transform transition-all duration-300 hover:scale-[1.02]",
        "stagger-delay-2"
      )}
      style={{ animationDelay: '0.2s' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-warning/15">
            <TrendingUp className="text-warning" size={24} />
          </div>
          <div>
            <h3 className={cn(tastePatterns.typography.label, "text-neutral-100 text-xs")}>
              Predicted Yield
            </h3>
            <p className="text-3xl font-bold text-neutral-100 mt-1">
              {(data.estimatedYield / 1000).toFixed(1)}
              <span className="text-lg text-neutral-500 ml-1">t/ha</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center py-1.5 border-t border-neutral-800">
          <span className="text-sm text-neutral-300">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3B6D11] transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-neutral-100">{confidencePercent}%</span>
          </div>
        </div>

        {data.recommendations && data.recommendations.length > 0 && (
          <div className="pt-2 border-t border-neutral-800">
            <p className="text-xs font-medium text-neutral-400 mb-2">Quick Tips:</p>
            <ul className="space-y-1">
              {data.recommendations.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <ChevronRight size={14} className="text-[#3B6D11] mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Disease Risk Card Component
const DiseaseRiskCard = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Disease Risk" 
        message="Unable to load risk data" 
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-48 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  const riskColor = getRiskColor(data.riskLevel);

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "stagger-delay-3"
      )}
      style={{ animationDelay: '0.3s' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${riskColor}15` }}>
            <AlertTriangle style={{ color: riskColor }} size={24} />
          </div>
          <div>
            <h3 className={cn(tastePatterns.typography.label, "text-neutral-100 text-xs")}>
              Disease Risk
            </h3>
            <p className="text-2xl font-bold mt-1 capitalize" style={{ color: riskColor }}>
              {data.riskLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center py-1.5 border-t border-neutral-800">
          <span className="text-sm text-neutral-300">Risk Score</span>
          <span className="text-sm font-semibold text-neutral-100">{data.riskScore}/100</span>
        </div>

        {data.potentialDiseases && data.potentialDiseases.length > 0 && (
          <div className="pt-2 border-t border-neutral-800">
            <p className="text-xs font-medium text-neutral-400 mb-2">Potential Threats:</p>
            <div className="space-y-2">
              {data.potentialDiseases.slice(0, 2).map((disease, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-xs text-neutral-300">{disease.disease}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded" 
                        style={{ 
                          backgroundColor: `${getRiskColor(disease.severity)}15`,
                          color: getRiskColor(disease.severity)
                        }}>
                    {Math.round(disease.probability * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.preventionMeasures && data.preventionMeasures.length > 0 && (
          <div className="pt-2 border-t border-neutral-800">
            <p className="text-xs font-medium text-neutral-400 mb-2">Prevention:</p>
            <ul className="space-y-1">
              {data.preventionMeasures.slice(0, 2).map((measure, idx) => (
                <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                  <ChevronRight size={14} className="text-[#3B6D11] mt-0.5 flex-shrink-0" />
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Market Score Card Component
const MarketScoreCard = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Market Data" 
        message="Unable to load market info" 
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-48 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "stagger-delay-4"
      )}
      style={{ animationDelay: '0.4s' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent-500/15">
            <TrendingUp className="text-accent-500" size={24} />
          </div>
          <div>
            <h3 className={cn(tastePatterns.typography.label, "text-neutral-100 text-xs")}>
              Market Score
            </h3>
            <p className="text-3xl font-bold text-neutral-100 mt-1">
              {data.marketScore}
              <span className="text-lg text-neutral-500 ml-1">/100</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center py-1.5 border-t border-neutral-800">
          <span className="text-sm text-neutral-300">{data.crop} Price</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-100">{data.unit} {data.price}</p>
            <p className={cn(
              "text-xs font-medium",
              data.trend === 'up' ? 'text-[#3B6D11]' : 'text-[#B45309]'
            )}>
              {data.trend === 'up' ? '↗' : '↘'} {data.change}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center py-1.5 border-t border-neutral-800">
          <span className="text-sm text-neutral-300">Demand Level</span>
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            data.demandLevel === 'High' ? 'bg-success/15 text-success' : 'bg-neutral-800 text-neutral-300'
          )}>
            {data.demandLevel}
          </span>
        </div>
      </div>
    </div>
  );
};

// Weather Forecast Section Component
const WeatherForecastSection = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Weather Forecast" 
        message="Unable to load weather data" 
        onRetry={onRetry}
      />
    );
  }

  if (!data || !data.forecast) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-48 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  const getWeatherIcon = (condition) => {
    const lower = condition?.toLowerCase() || '';
    if (lower.includes('sun') || lower.includes('clear')) return <Sun className="text-amber-500" size={32} />;
    if (lower.includes('cloud')) return <Cloud className="text-stone-400" size={32} />;
    if (lower.includes('rain')) return <Droplets className="text-blue-500" size={32} />;
    return <Cloud className="text-stone-400" size={32} />;
  };

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "stagger-delay-5"
      )}
      style={{ animationDelay: '0.5s' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(tastePatterns.typography.h4, "text-neutral-100")}>
          7-Day Forecast
        </h3>
        <Calendar size={20} className="text-neutral-400" />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {data.forecast.slice(0, 7).map((day, idx) => (
          <div 
            key={idx}
            className="text-center p-3 rounded-lg border border-neutral-800 hover:border-primary-500/30 hover:bg-neutral-800 transition-all duration-200"
          >
            <p className="text-xs font-medium text-neutral-400 mb-2">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            <div className="flex justify-center mb-2">
              {getWeatherIcon(day.condition)}
            </div>
            <p className="text-lg font-bold text-neutral-100">{day.tempMax}°</p>
            <p className="text-xs text-neutral-400">{day.tempMin}°</p>
            {day.precipitation > 0 && (
              <p className="text-xs text-accent-500 mt-1 flex items-center justify-center gap-1">
                <Droplets size={12} />
                {day.precipitation}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Crop Recommendations Card Component
const CropRecommendationsCard = ({ data, error, onRetry }) => {
  if (error) {
    return (
      <ErrorCard 
        title="Crop Recommendations" 
        message="Unable to load recommendations" 
        onRetry={onRetry}
      />
    );
  }

  if (!data || !data.recommendedCrops) {
    return (
      <div className={cn(tastePatterns.earthyCard.base, "animate-pulse")}>
        <div className="h-48 bg-neutral-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        tastePatterns.earthyCard.base,
        tastePatterns.earthyCard.hover,
        "stagger-delay-6"
      )}
      style={{ animationDelay: '0.6s' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(tastePatterns.typography.h4, "text-neutral-100")}>
          Recommended Crops
        </h3>
        <Leaf size={20} className="text-[#3B6D11]" />
      </div>

      <div className="space-y-4">
        {data.recommendedCrops.slice(0, 3).map((crop, idx) => (
          <div 
            key={idx}
            className="p-3 rounded-lg border-l-4 bg-neutral-800/60 hover:bg-neutral-800 transition-all duration-200"
            style={{ 
              borderLeftColor: idx === 0 ? AGRITECH_COLORS.primary.main : AGRITECH_COLORS.neutral.earth 
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-base font-semibold text-neutral-100 capitalize">{crop.crop}</h4>
                {idx === 0 && data.bestCrop === crop.crop && (
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#3B6D11] text-white">
                    Best Choice
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#3B6D11]">{crop.suitabilityScore}</p>
                <p className="text-xs text-neutral-400">Suitability</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-neutral-800">
              <div>
                <p className="text-xs text-neutral-400">Expected Yield</p>
                <p className="text-sm font-semibold text-neutral-100">{crop.expectedYield} kg/ha</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Profit Margin</p>
                <p className="text-sm font-semibold text-neutral-100">{crop.profitMargin}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Active Alerts Section Component
const ActiveAlertsSection = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className={cn(tastePatterns.earthyCard.base)}>
        <div className="flex items-center gap-2.5 mb-3">
          <Activity className="text-neutral-400" size={20} />
          <h3 className={cn(tastePatterns.typography.h4, "text-neutral-100")}>
            Active Alerts
          </h3>
        </div>
        <div className="text-center py-8">
          <Eye className="text-neutral-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-neutral-400">No active alerts</p>
          <p className="text-xs text-neutral-500 mt-1">All systems normal</p>
        </div>
      </div>
    );
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'warning': return tastePatterns.alert.warning;
      case 'error': return tastePatterns.alert.error;
      case 'info': return tastePatterns.alert.info;
      default: return tastePatterns.alert.success;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-[#B45309] text-white',
      medium: 'bg-[#D97706] text-white',
      low: 'bg-neutral-800 text-neutral-300'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className={cn(tastePatterns.earthyCard.base, "stagger-delay-7")} style={{ animationDelay: '0.7s' }}>
      <div className="flex items-center gap-2.5 mb-3">
        <Activity className="text-[#3B6D11]" size={20} />
        <h3 className={cn(tastePatterns.typography.h4, "text-neutral-100")}>
          Active Alerts
        </h3>
        <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-[#3B6D11] text-white">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(getAlertStyle(alert.type), "relative group")}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0">
                {alert.type === 'warning' && <AlertTriangle size={18} className="text-[#D97706]" />}
                {alert.type === 'info' && <Activity size={18} className="text-[#0D4A6B]" />}
                {alert.type === 'error' && <AlertTriangle size={18} className="text-[#B45309]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-semibold text-neutral-100">{alert.title}</h4>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityBadge(alert.priority))}>
                    {alert.priority}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{alert.message}</p>
                <p className="text-xs text-neutral-500 mt-2">
                  {new Date(alert.timestamp).toLocaleString('en-IN', { 
                    dateStyle: 'short', 
                    timeStyle: 'short' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className={cn(
          tastePatterns.farmerButton.outline,
          "w-full mt-4 text-sm"
        )}
      >
        View All Alerts
      </button>
    </div>
  );
};

// AI Chat Widget Component
const ChatWidget = ({ isOpen, isMinimized, messages, input, loading, onToggle, onMinimize, onInputChange, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "fixed bottom-5 right-5 p-3.5 rounded-full shadow-lg z-50",
          "bg-[#3B6D11] text-white hover:bg-[#2D5309]",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-5 right-5 z-50 transition-all duration-300",
        isMinimized ? "w-72" : "w-[22rem] h-[460px]"
      )}
    >
      <div className={cn(tastePatterns.earthyCard.base, "h-full flex flex-col shadow-2xl")}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#3B6D11] rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-white" size={20} />
            <h3 className="text-sm font-semibold text-white">AI Farm Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="text-white" size={16} /> : <Minimize2 className="text-white" size={16} />}
            </button>
            <button 
              onClick={onToggle}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="text-white" size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-neutral-900/80">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="text-neutral-600 mx-auto mb-2" size={32} />
                  <p className="text-sm text-neutral-400">Ask me anything about farming!</p>
                  <p className="text-xs text-neutral-500 mt-1">I can help with crop advice, weather insights, and more</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg max-w-[85%]",
                      msg.role === 'user' 
                        ? "ml-auto bg-[#3B6D11] text-white" 
                        : "mr-auto bg-neutral-800 border border-neutral-700 text-neutral-100"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <div className="animate-pulse">●</div>
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-900 rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className={cn(tastePatterns.input.base, "flex-1 text-sm")}
                  disabled={loading}
                />
                <button
                  onClick={onSend}
                  disabled={loading || !input.trim()}
                  className={cn(
                    tastePatterns.farmerButton.primary,
                    "px-4",
                    (loading || !input.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Error Card Component (Reusable)
const ErrorCard = ({ title, message, onRetry }) => {
  return (
    <div className={cn(tastePatterns.earthyCard.base, "border-l-4 border-[#B45309]")}>
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="text-[#B45309] flex-shrink-0" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-neutral-100">{title}</h4>
          <p className="text-xs text-neutral-400 mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className={cn(tastePatterns.farmerButton.outline, "w-full text-xs")}
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Helper function for risk color (used in multiple components)
const getRiskColor = (level) => {
  const lower = level?.toLowerCase() || '';
  if (lower.includes('low')) return AGRITECH_COLORS.semantic.success;
  if (lower.includes('moderate') || lower.includes('medium')) return AGRITECH_COLORS.semantic.warning;
  return AGRITECH_COLORS.semantic.error;
};

export default Dashboard;
