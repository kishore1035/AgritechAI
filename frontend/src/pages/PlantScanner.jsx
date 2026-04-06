import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, CheckCircle2, TrendingUp, Calendar,
  Sprout, Shield, Lightbulb, Save, History, ArrowLeft
} from 'lucide-react';
import CropHealthScanner from '../components/CropHealthScanner';
import { cropsAPI } from '../services/api';

const healthColorMap = {
  good: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  fair: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  poor: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
};

function getHealthStatus(score) {
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function ResultsCard({ data, onSave }) {
  const healthStatus = getHealthStatus(data.healthScore);
  const colors = healthColorMap[healthStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Crop Name & Health Score */}
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className={`${colors.text} text-2xl font-bold`}>{data.cropName}</h2>
            <p className="text-neutral-400 text-sm mt-1">{data.growthStage || 'Growth stage not determined'}</p>
          </div>
          {healthStatus === 'good' && <CheckCircle2 className={`${colors.text} w-8 h-8`} />}
          {healthStatus === 'fair' && <AlertTriangle className="text-yellow-400 w-8 h-8" />}
          {healthStatus === 'poor' && <AlertTriangle className="text-red-400 w-8 h-8" />}
        </div>

        {/* Health Score Bar */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium">Plant Health</span>
            <span className={`${colors.text} text-2xl font-bold`}>{data.healthScore}/100</span>
          </div>
          <div className="w-full bg-neutral-800/50 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${healthStatus === 'good' ? 'bg-green-500' : healthStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Harvest Countdown */}
      {data.daysToHarvest !== null && (
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-brand w-5 h-5" />
            <span className="text-sm font-medium">Time to Harvest</span>
          </div>
          <div className="text-3xl font-bold text-brand">
            🌾 Ready in {data.daysToHarvest} days
          </div>
          {data.harvestDate && (
            <p className="text-xs text-neutral-400 mt-2">
              Est. {new Date(data.harvestDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Ripeness */}
      {data.ripeness !== null && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky-400">Ripeness Level</span>
            <span className="text-xl font-bold text-sky-400">{data.ripeness}%</span>
          </div>
          <div className="w-full bg-neutral-800/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.ripeness}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-sky-500"
            />
          </div>
        </div>
      )}

      {/* Issues Detected */}
      {data.detectedIssues && data.detectedIssues.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-400 w-5 h-5" />
            <span className="font-semibold text-red-400">Issues Detected ({data.detectedIssues.length})</span>
          </div>
          <div className="space-y-2">
            {data.detectedIssues.map((issue, idx) => (
              <div key={idx} className="bg-neutral-900/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    issue.severity === 'high' ? 'bg-red-500' : issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{issue.name}</p>
                    <p className="text-xs text-neutral-400 mt-1">{issue.description}</p>
                    <span className={`text-xs font-medium mt-2 inline-block px-2 py-1 rounded ${
                      issue.severity === 'high' ? 'bg-red-500/20 text-red-300' : 
                      issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Tips */}
      {data.maintenanceTips && data.maintenanceTips.length > 0 && (
        <div className="bg-brand/10 border border-brand/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-brand w-5 h-5" />
            <span className="font-semibold">Maintenance Tips</span>
          </div>
          <div className="space-y-2">
            {data.maintenanceTips.map((tip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand/10 border border-brand/20 rounded-lg p-3 flex gap-3"
              >
                <Shield className="text-brand w-4 h-4 flex-shrink-0 mt-1" />
                <p className="text-sm text-neutral-200">{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Save to Farm */}
      <button
        onClick={onSave}
        className="w-full bg-brand/20 hover:bg-brand/30 border border-brand/40 hover:border-brand/60 text-brand py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save Analysis to Farm
      </button>
    </motion.div>
  );
}

export default function PlantScanner() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPastAnalyses();
  }, []);

  const loadPastAnalyses = async () => {
    try {
      const response = await cropsAPI.getAnalyses();
      setPastAnalyses(response.data.data || []);
    } catch (err) {
      console.error('Failed to load past analyses:', err);
    }
  };

  const handleImageSelect = (file) => {
    setSelectedFile(file);
    analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await cropsAPI.analyzeCrop(formData);
      setAnalysisResult(response.data.data);
      setSelectedFile(null);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.error || 'Failed to analyze crop image');
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFarm = () => {
    navigate('/farms');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-4 md:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-brand/5 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] bg-amber-500/4 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-50">
              <span className="flex items-center gap-3">
                <Sprout className="w-8 h-8 text-brand" />
                Plant Scanner
              </span>
            </h1>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-neutral-400 hover:text-neutral-200 flex items-center gap-2 text-sm"
            >
              <History className="w-4 h-4" />
              History ({pastAnalyses.length})
            </button>
          </div>
          <p className="text-neutral-400 mt-2">Upload or capture a crop image for instant health analysis</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-neutral-900/40 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Scan Your Crop</h2>
            <CropHealthScanner
              onImageSelect={handleImageSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Results Section */}
          {analysisResult ? (
            <div className="bg-neutral-900/40 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6">Analysis Results</h2>
              <ResultsCard
                data={analysisResult}
                onSave={handleSaveToFarm}
              />
            </div>
          ) : !isLoading ? (
            <div className="bg-neutral-900/40 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center">
                <Sprout className="w-12 h-12 text-brand/30 mx-auto mb-3" />
                <p className="text-neutral-400">Upload or capture an image to get started</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* History Section */}
        <AnimatePresence>
          {showHistory && pastAnalyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-neutral-900/40 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pastAnalyses.map((analysis) => (
                  <div key={analysis.id} className="bg-neutral-900/50 border border-white/[0.05] rounded-lg p-4 cursor-pointer hover:bg-neutral-900/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-neutral-200">{analysis.cropName}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          analysis.healthScore >= 75 ? 'text-green-400' :
                          analysis.healthScore >= 50 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {analysis.healthScore}/100
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
