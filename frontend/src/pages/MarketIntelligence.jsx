import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, Button } from '../components';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, MapPin, RefreshCw, Minus } from 'lucide-react';
import { tastePatterns, motionPresets, AGRITECH_COLORS } from '../tasteSkillConfig';

/**
 * Market Intelligence Page
 * Real farmer tool for crop pricing and market analysis
 * Following taste-skill SKILL.md design system:
 * - DESIGN_VARIANCE = 7: Split-screen layout
 * - MOTION = 5: Smooth chart animations, staggered news feed
 * - DENSITY = 6: Clean chart containers, good spacing
 * - Earthy palette, NO purple gradients
 * - Data authenticity: Realistic prices (₹1,247.50 not ₹1000.00)
 */

function MarketIntelligence({ onAlert }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch market data from API
  useEffect(() => {
    fetchMarketData();
  }, [selectedCrop]);

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Simulate API call - Replace with actual API endpoint
      // const response = await fetch('/api/crops/market-data');
      // const data = await response.json();
      
      // Mock data with realistic values
      setTimeout(() => {
        setMarketData(getMockMarketData());
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setLoading(false);
    }
  };

  // Mock market data with realistic Indian crop prices
  const getMockMarketData = () => ({
    priceTrends: [
      { date: 'Jan 15', price: 2347.50, volume: 1245 },
      { date: 'Jan 22', price: 2389.25, volume: 1567 },
      { date: 'Jan 29', price: 2456.75, volume: 1823 },
      { date: 'Feb 5', price: 2423.00, volume: 1678 },
      { date: 'Feb 12', price: 2498.50, volume: 1934 },
      { date: 'Feb 19', price: 2534.25, volume: 2145 },
      { date: 'Today', price: 2567.80, volume: 2289 },
    ],
    investmentScore: {
      score: 78,
      recommendation: 'BUY',
      confidence: 85,
      factors: [
        { name: 'Price Trend', value: 8.5, status: 'positive' },
        { name: 'Demand', value: 7.2, status: 'positive' },
        { name: 'Seasonal Fit', value: 6.8, status: 'neutral' },
        { name: 'Market Volatility', value: 4.5, status: 'negative' },
      ]
    },
    regionalPrices: [
      { region: 'Punjab', price: 2567.80, change: 8.2, traders: 45 },
      { region: 'Haryana', price: 2534.50, change: 7.8, traders: 38 },
      { region: 'Uttar Pradesh', price: 2498.25, change: 6.5, traders: 52 },
      { region: 'Madhya Pradesh', price: 2445.75, change: 5.2, traders: 31 },
      { region: 'Rajasthan', price: 2412.30, change: 4.8, traders: 28 },
    ],
    news: [
      { 
        id: 1,
        title: 'Wheat procurement reaches record high in Punjab',
        source: 'AgriNews India',
        sentiment: 'positive',
        timestamp: '2 hours ago',
        summary: 'Government procurement of wheat crosses 15 million tonnes, supporting farmer prices across northern states.'
      },
      { 
        id: 2,
        title: 'Export demand for Indian wheat surges in Middle East',
        source: 'Commodity Insights',
        sentiment: 'positive',
        timestamp: '5 hours ago',
        summary: 'International buyers increase wheat imports by 23% driving domestic prices upward.'
      },
      { 
        id: 3,
        title: 'Weather patterns may affect spring harvest',
        source: 'Farm Bureau',
        sentiment: 'neutral',
        timestamp: '8 hours ago',
        summary: 'Meteorological department forecasts irregular rainfall patterns in wheat-growing regions.'
      },
      { 
        id: 4,
        title: 'Storage capacity concerns in major mandis',
        source: 'Mandi Report',
        sentiment: 'negative',
        timestamp: '12 hours ago',
        summary: 'Limited warehouse space may pressure farmers to sell at lower prices in coming weeks.'
      },
    ],
    historicalComparison: [
      { month: 'Aug', thisYear: 2234, lastYear: 2156 },
      { month: 'Sep', thisYear: 2289, lastYear: 2198 },
      { month: 'Oct', thisYear: 2356, lastYear: 2245 },
      { month: 'Nov', thisYear: 2423, lastYear: 2312 },
      { month: 'Dec', thisYear: 2489, lastYear: 2378 },
      { month: 'Jan', thisYear: 2534, lastYear: 2434 },
      { month: 'Feb', thisYear: 2568, lastYear: 2467 },
    ]
  });

  // Chart custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-neutral-400 mb-1">{label}</p>
          <p className="text-sm font-semibold text-[#3B6D11]">
            ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {payload[0].payload.volume && (
            <p className="text-xs text-neutral-500 mt-1">
              Volume: {payload[0].payload.volume} tonnes
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Sentiment badge component
  const SentimentBadge = ({ sentiment }) => {
    const styles = {
      positive: 'bg-[#EEF4E8] text-[#3B6D11] border-[#3B6D11]',
      negative: 'bg-orange-50 text-[#B45309] border-[#B45309]',
      neutral: 'bg-blue-50 text-[#0D4A6B] border-[#0D4A6B]',
    };
    
    const icons = {
      positive: <TrendingUp size={12} />,
      negative: <TrendingDown size={12} />,
      neutral: <Minus size={12} />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${styles[sentiment]}`}>
        {icons[sentiment]} {sentiment}
      </span>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-5 p-4 md:p-6 w-full bg-neutral-900 min-h-screen">
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-neutral-800 rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-96 bg-neutral-800 rounded-lg"></div>
            <div className="h-96 bg-neutral-800 rounded-lg"></div>
          </div>
          <div className="h-64 bg-neutral-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!marketData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <motion.div 
          className="text-center max-w-md"
          {...motionPresets.fadeInUp}
        >
          <AlertCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-300 mb-2">No market data available</h3>
          <p className="text-sm text-neutral-500 mb-4">
            We couldn't fetch the latest market information. Please check your connection and try again.
          </p>
          <Button onClick={fetchMarketData} className={tastePatterns.farmerButton.primary}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  const { priceTrends, investmentScore, regionalPrices, news, historicalComparison } = marketData;
  const currentPrice = priceTrends[priceTrends.length - 1].price;
  const priceChange = currentPrice - priceTrends[priceTrends.length - 2].price;
  const priceChangePercent = ((priceChange / priceTrends[priceTrends.length - 2].price) * 100).toFixed(2);

  return (
    <div className="w-full bg-neutral-900 min-h-screen">
      <div className="space-y-5 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header with current price */}
        <motion.div {...motionPresets.fadeInUp}>
          <div className="flex items-start justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-neutral-100 mb-1">
                {t('market.title')}
              </h1>
              <p className="text-xs text-neutral-400">
                Real-time crop pricing and investment analysis
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-500 mb-1">Current Price</div>
              <div className="text-2xl font-bold text-neutral-100">
                ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-medium flex items-center justify-end gap-1 mt-1 ${priceChange >= 0 ? 'text-[#3B6D11]' : 'text-[#B45309]'}`}>
                {priceChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {priceChange >= 0 ? '+' : ''}{priceChangePercent}% today
              </div>
            </div>
          </div>
        </motion.div>

        {/* Split-screen layout (DESIGN_VARIANCE = 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Price Trend Chart */}
          <motion.div {...motionPresets.scaleIn}>
            <Card>
              <Card.Header 
                title="Price Trend Analysis"
                subtitle="Last 7 days"
                action={
                  <div className="flex gap-2 text-xs">
                    <button className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors">7D</button>
                    <button className="px-2 py-1 rounded text-neutral-500 hover:bg-neutral-800 transition-colors">1M</button>
                    <button className="px-2 py-1 rounded text-neutral-500 hover:bg-neutral-800 transition-colors">3M</button>
                  </div>
                }
              />
              <Card.Body>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={priceTrends}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B6D11" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B6D11" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#8B7355', fontSize: 11 }}
                      stroke="#4a4a4a"
                    />
                    <YAxis 
                      tick={{ fill: '#8B7355', fontSize: 11 }}
                      stroke="#4a4a4a"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B6D11" 
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </motion.div>

          {/* RIGHT: Investment Score Card */}
          <motion.div {...motionPresets.scaleIn} transition={{ delay: 0.1 }}>
            <Card>
              <Card.Header title="Investment Recommendation" />
              <Card.Body>
                {/* Score meter */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-neutral-100">{investmentScore.score}</span>
                    <span className="text-neutral-500 text-lg">/100</span>
                  </div>
                  <div className={`inline-block px-4 py-1.5 rounded-lg text-sm font-semibold ${
                    investmentScore.recommendation === 'BUY' 
                      ? 'bg-[#EEF4E8] text-[#3B6D11]'
                      : investmentScore.recommendation === 'HOLD'
                      ? 'bg-blue-50 text-[#0D4A6B]'
                      : 'bg-orange-50 text-[#B45309]'
                  }`}>
                    {investmentScore.recommendation}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {investmentScore.confidence}% confidence level
                  </p>
                </div>

                {/* Factors */}
                <div className="space-y-3">
                  {investmentScore.factors.map((factor, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="space-y-1.5"
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300 font-medium">{factor.name}</span>
                        <span className={`font-semibold ${
                          factor.status === 'positive' ? 'text-[#3B6D11]' :
                          factor.status === 'negative' ? 'text-[#B45309]' :
                          'text-[#D97706]'
                        }`}>
                          {factor.value.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${
                            factor.status === 'positive' ? 'bg-[#3B6D11]' :
                            factor.status === 'negative' ? 'bg-[#B45309]' :
                            'bg-[#D97706]'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.value * 10}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </div>

        {/* Regional Price Comparison */}
        <motion.div {...motionPresets.fadeInUp}>
          <Card>
            <Card.Header 
              title="Price Comparison by Region"
              subtitle="Wholesale prices per quintal"
              action={<MapPin className="text-[#8B7355]" size={20} />}
            />
            <Card.Body>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left text-xs font-semibold text-neutral-400 pb-3 uppercase tracking-wide">Region</th>
                      <th className="text-right text-xs font-semibold text-neutral-400 pb-3 uppercase tracking-wide">Price</th>
                      <th className="text-right text-xs font-semibold text-neutral-400 pb-3 uppercase tracking-wide">Change</th>
                      <th className="text-right text-xs font-semibold text-neutral-400 pb-3 uppercase tracking-wide">Active Traders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalPrices.map((region, idx) => (
                      <motion.tr 
                        key={idx}
                        className="border-t border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        <td className="py-3 text-sm font-medium text-neutral-200">{region.region}</td>
                        <td className="py-3 text-right text-sm font-semibold text-neutral-100">
                          ₹{region.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3 text-right text-sm font-medium ${region.change >= 0 ? 'text-[#3B6D11]' : 'text-[#B45309]'}`}>
                          {region.change >= 0 ? '+' : ''}{region.change.toFixed(1)}%
                        </td>
                        <td className="py-3 text-right text-sm text-neutral-400">{region.traders}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* News Feed & Historical Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Market News Feed */}
          <motion.div {...motionPresets.scaleIn}>
            <Card>
              <Card.Header title="Market News Feed" subtitle="Latest agriculture updates" />
              <Card.Body className="space-y-0">
                {news.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className="py-3 border-t border-neutral-800 first:border-t-0 hover:bg-neutral-800/30 transition-colors px-2 -mx-2 rounded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.08 }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-sm text-neutral-100 leading-tight flex-1">
                        {item.title}
                      </h4>
                      <SentimentBadge sentiment={item.sentiment} />
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Historical Comparison */}
          <motion.div {...motionPresets.scaleIn} transition={{ delay: 0.1 }}>
            <Card>
              <Card.Header 
                title="Year-over-Year Comparison"
                subtitle="Price trends vs last year"
                action={<Calendar className="text-[#8B7355]" size={20} />}
              />
              <Card.Body>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={historicalComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#8B7355', fontSize: 11 }}
                      stroke="#4a4a4a"
                    />
                    <YAxis 
                      tick={{ fill: '#8B7355', fontSize: 11 }}
                      stroke="#4a4a4a"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="thisYear" 
                      stroke="#3B6D11" 
                      strokeWidth={2}
                      name="2025"
                      dot={{ fill: '#3B6D11', r: 4 }}
                      animationDuration={800}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lastYear" 
                      stroke="#8B7355" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="2024"
                      dot={{ fill: '#8B7355', r: 4 }}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MarketIntelligence;
