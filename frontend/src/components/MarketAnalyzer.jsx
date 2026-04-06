/**
 * MarketAnalyzer.jsx
 * Comprehensive market analysis and investment recommendation component
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { cropsAPI } from '../services/api';
import {
  Upload,
  TrendingUp,
  TrendingDown,
  Zap,
  MapPin,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Loader
} from 'lucide-react';

export default function MarketAnalyzer() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze'); // analyze, market, investment, compare
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [farmArea, setFarmArea] = useState(1);
  const [selectedCrops, setSelectedCrops] = useState(['rice', 'wheat']);
  const [comparingCrops, setComparingCrops] = useState(null);
  const [searchCrop, setSearchCrop] = useState('');
  const [cropMarketData, setCropMarketData] = useState(null);

  // Handle image upload and analysis
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('area', farmArea);

      const response = await cropsAPI.analyzeImageWithMarket(formData);
      setResult(response.data);
      setActiveTab('analyze');
    } catch (error) {
      alert('Error analyzing image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch best investment opportunities
  const handleGetBestInvestment = async () => {
    setLoading(true);
    try {
      const response = await cropsAPI.getBestInvestment(farmArea);
      setResult(response.data);
      setActiveTab('investment');
    } catch (error) {
      alert('Error fetching investment data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Compare crops
  const handleCompareCrops = async () => {
    if (selectedCrops.length === 0) {
      alert('Select at least one crop to compare');
      return;
    }

    setLoading(true);
    try {
      const response = await cropsAPI.compareCrops({
        crops: selectedCrops,
        area: farmArea
      });
      setComparingCrops(response.data);
      setActiveTab('compare');
    } catch (error) {
      alert('Error comparing crops: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search crop market data
  const handleSearchCrop = async () => {
    if (!searchCrop) return;

    setLoading(true);
    try {
      const response = await cropsAPI.getCropMarketData(searchCrop, farmArea);
      setCropMarketData(response.data);
      setActiveTab('market');
    } catch (error) {
      alert('Error fetching market data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderImageAnalysis = () => {
    if (!result?.imageAnalysis) return null;

    const { imageAnalysis, marketRecommendations, profitAnalysis, seasonalContext, insights } = result;

    return (
      <div className="space-y-6">
        {/* Image Analysis Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Image Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Health Score</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full"
                    style={{width: `${(imageAnalysis.healthScore || 0) * 100}%`}}
                  ></div>
                </div>
                <span className="font-bold">{Math.round((imageAnalysis.healthScore || 0) * 100)}%</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Confidence Level</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {Math.round((imageAnalysis.confidence || 0) * 100)}%
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-2">Suggested Crops</p>
            <div className="flex flex-wrap gap-2">
              {imageAnalysis.suggestedCrops?.map(crop => (
                <span key={crop} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {imageAnalysis.issues && imageAnalysis.issues.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">Issues Detected:</p>
              <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                {imageAnalysis.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Market Recommendations
          </h3>

          {marketRecommendations.topChoice && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <h4 className="font-bold text-lg text-green-800 mb-3">
                🏆 Top Choice: {marketRecommendations.topChoice.crop}
              </h4>
              <div className="space-y-2">
                <p><strong>Investment Score:</strong> {marketRecommendations.topChoice.investmentScore}/100</p>
                <p><strong>Market Sentiment:</strong> {marketRecommendations.topChoice.marketIntelligence.sentiment}</p>
                <p><strong>Recommendation:</strong> {marketRecommendations.topChoice.recommendation.overall}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketRecommendations.allOptions?.map((option, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h4 className="font-bold text-lg mb-3 capitalize">{option.crop}</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Investment Score:</span>
                    <span className="font-bold">{option.investmentScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Sentiment:</span>
                    <span className={option.marketIntelligence.sentiment === 'bullish' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {option.marketIntelligence.sentiment === 'bullish' ? '📈' : '📉'} {option.marketIntelligence.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seasonal:</span>
                    <span className={option.seasonalSuitability.timing === 'OPTIMAL' ? 'text-green-600' : 'text-yellow-600'}>
                      {option.seasonalSuitability.timing}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-green-500" />
            Profit Analysis ({profitAnalysis.area})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profitAnalysis.crops?.map((crop, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <h4 className="font-bold capitalize mb-3">{crop.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="text-green-600 font-semibold">{crop.expectedRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="text-red-600 font-semibold">{crop.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span>Profit:</span>
                    <span className="text-blue-600 font-bold">{crop.netProfit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span className="text-purple-600 font-semibold">{crop.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Context */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Seasonal Context
          </h3>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Season</p>
            <p className="text-2xl font-bold text-blue-600">
              {seasonalContext.currentSeason.currentSeason} ({seasonalContext.currentSeason.currentMonth})
            </p>
          </div>

          <div>
            <p className="font-semibold mb-3">Best Crops to Plant Now:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seasonalContext.bestCropsNow?.map((crop, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-green-50">
                  <p className="font-semibold capitalize">{crop.crop}</p>
                  <p className="text-sm text-gray-600">Plant: {crop.plantingMonth}</p>
                  <p className="text-xs text-gray-500">{crop.months}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights?.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">💡 Key Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {insight.type === 'TOP_CHOICE' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {insight.type === 'MARKET_TREND' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                    {insight.type === 'SEASONAL' && <Calendar className="w-5 h-5 text-yellow-600" />}
                    {insight.type === 'RISK_WARNING' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInvestmentTab = () => {
    if (!result?.topInvestments) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Current Season: {result.currentSeason.season}</h3>
          <p className="text-gray-600">Area: {result.area}</p>

          <div className="mt-6">
            <h4 className="font-bold mb-4 text-lg">Top 5 Investment Opportunities</h4>
            <div className="space-y-3">
              {result.topInvestments?.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-lg capitalize">{item.crop}</p>
                      <p className="text-sm text-gray-600">{item.seasonal.season}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600">Score</p>
                      <p className="text-2xl font-bold text-blue-600">{item.score}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-bold text-green-600">{item.profitEstimate.netProfit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-bold">{item.profitEstimate.roi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market:</span>
                      <span className={item.marketSentiment === 'bullish' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {item.marketSentiment === 'bullish' ? '📈' : '📉'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonTab = () => {
    if (!comparingCrops) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Crop Comparison ({comparingCrops.area})</h3>

        <div className="space-y-4">
          {comparingCrops.comparison?.map((crop, idx) => (
            <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg capitalize">{crop.crop}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  crop.investmentScore.startsWith('100') || crop.investmentScore.startsWith('9') 
                    ? 'bg-green-100 text-green-800'
                    : crop.investmentScore.startsWith('7') || crop.investmentScore.startsWith('8')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {crop.investmentScore}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Profit</p>
                  <p className="font-bold text-green-600">{crop.profitAnalysis?.netProfit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">ROI</p>
                  <p className="font-bold">{crop.profitAnalysis?.roi}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Market</p>
                  <p className={`font-bold ${crop.marketIntelligence.sentiment === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
                    {crop.marketIntelligence.trend}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-semibold text-sm">Seasonal: {crop.seasonalFit}</span>
                <span className="text-xs font-bold text-blue-600">{crop.recommendation}</span>
              </div>
            </div>
          ))}
        </div>

        {comparingCrops.recommendation && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="font-bold text-green-800 mb-2">🏆 Best Choice:</p>
            <p className="text-green-700">{comparingCrops.recommendation.crop}</p>
          </div>
        )}
      </div>
    );
  };

  const renderMarketDataTab = () => {
    if (!cropMarketData) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 capitalize">{cropMarketData.crop} - Market Intelligence</h3>

          {/* News */}
          {cropMarketData.news?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3">📰 Recent News</h4>
              <div className="space-y-3">
                {cropMarketData.news.map((article, idx) => (
                  <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded hover:bg-gray-50">
                    <p className="font-semibold text-sm line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Price Searches */}
          {cropMarketData.recentPriceSearches?.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3">💹 Recent Price Data</h4>
              <div className="space-y-2">
                {cropMarketData.recentPriceSearches.slice(0, 3).map((search, idx) => (
                  <a key={idx} href={search.link} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded hover:bg-gray-50">
                    <p className="font-semibold text-sm">{search.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{search.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Profit Analysis */}
          {cropMarketData.profitEstimate && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-bold mb-3">📊 Profit Analysis ({cropMarketData.area})</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Expected Revenue</p>
                  <p className="font-bold text-green-600">{cropMarketData.profitEstimate.expectedRevenue}</p>
                </div>
                <div>
                  <p className="text-gray-600">Net Profit</p>
                  <p className="font-bold text-blue-600">{cropMarketData.profitEstimate.netProfit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-bold text-red-600">{cropMarketData.profitEstimate.totalCost}</p>
                </div>
                <div>
                  <p className="text-gray-600">ROI</p>
                  <p className="font-bold">{cropMarketData.profitEstimate.roi}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Market Analyzer</h1>
          <p className="text-gray-600">AI-powered crop analysis with real-time market intelligence</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Farm Area */}
            <div>
              <label className="block text-sm font-semibold mb-2">Farm Area (Hectares)</label>
              <input
                type="number"
                value={farmArea}
                onChange={(e) => setFarmArea(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-2 border rounded-lg"
                min="0.1"
                step="0.5"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Upload Crop Image</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Choose Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGetBestInvestment}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
            >
              <TrendingUp className="w-4 h-4" />
              Best Investment Now
            </button>

            <button
              onClick={handleCompareCrops}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              Compare Crops
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                placeholder="Enter crop name..."
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchCrop()}
              />
              <button
                onClick={handleSearchCrop}
                disabled={loading || !searchCrop}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Tabs */}
        {(result || comparingCrops || cropMarketData) && !loading && (
          <>
            <div className="flex gap-2 mb-6 bg-white rounded-lg p-2 shadow-lg overflow-x-auto">
              {result && (
                <button
                  onClick={() => setActiveTab('analyze')}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    activeTab === 'analyze'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📸 Analysis
                </button>
              )}
              {result && (
                <button
                  onClick={() => setActiveTab('investment')}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    activeTab === 'investment'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📈 Investment
                </button>
              )}
              {comparingCrops && (
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    activeTab === 'compare'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚖️ Comparison
                </button>
              )}
              {cropMarketData && (
                <button
                  onClick={() => setActiveTab('market')}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    activeTab === 'market'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Market Data
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'analyze' && renderImageAnalysis()}
              {activeTab === 'investment' && renderInvestmentTab()}
              {activeTab === 'compare' && renderComparisonTab()}
              {activeTab === 'market' && renderMarketDataTab()}
            </div>
          </>
        )}

        {/* Empty State */}
        {!result && !comparingCrops && !cropMarketData && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Get Started</h3>
            <p className="text-gray-600">Upload a crop image, check best investment opportunities, or search for market data to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
