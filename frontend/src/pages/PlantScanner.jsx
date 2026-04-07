import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Leaf,
  FileImage,
  ArrowRight,
  Info
} from 'lucide-react';
import { tastePatterns, motionPresets, AGRITECH_COLORS } from '../tasteSkillConfig';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { cn } from '../utils/cn';

/**
 * Plant Scanner - Disease Detection Page
 * Following taste-skill SKILL.md design system
 * DESIGN_VARIANCE = 7, MOTION = 5, DENSITY = 6
 */

function PlantScanner() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  // File input change handler
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Clear image
  const handleClearImage = () => {
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Analyze image
  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/crops/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      // Transform response to match expected format
      setResult({
        disease: data.disease || data.detectedDisease || 'Unknown Disease',
        confidence: data.confidence || data.confidenceScore || 85,
        remediation: data.remediation || data.remediationSteps || data.recommendations || [
          'Inspect affected areas regularly',
          'Remove infected plant parts',
          'Apply appropriate treatment',
          'Monitor plant recovery'
        ],
        severity: data.severity || 'moderate',
        affectedArea: data.affectedArea || null
      });

      setShowResultModal(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1ED] dark:bg-[#1A1A1A]">
      {/* Header - Offset layout per DESIGN_VARIANCE=7 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          {...motionPresets.fadeInUp}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-[#3B6D11]/10">
              <Leaf className="w-7 h-7 text-[#3B6D11]" />
            </div>
            <h1 className={tastePatterns.typography.h1}>
              Plant Scanner
            </h1>
          </div>
          <p className={tastePatterns.typography.body}>
            Upload a photo of your plant to detect diseases and get remediation steps
          </p>
        </motion.div>

        {/* Main Content - Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
          
          {/* Left Column - Upload Area */}
          <motion.div
            {...motionPresets.slideInOffset}
            className="space-y-5"
          >
            {/* Upload Zone */}
            {!imagePreview ? (
              <UploadZone
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClickUpload={() => fileInputRef.current?.click()}
                onClickCamera={() => cameraInputRef.current?.click()}
              />
            ) : (
              <ImagePreview
                preview={imagePreview}
                onClear={handleClearImage}
                isAnalyzing={isAnalyzing}
              />
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={tastePatterns.alert.error}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-[#1A1A1A]">Upload Error</h4>
                      <p className="text-sm mt-1 text-[#4A4A4A]">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze Button */}
            {imagePreview && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  loading={isAnalyzing}
                  fullWidth
                  size="lg"
                  className={tastePatterns.farmerButton.primary}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
                </Button>
              </motion.div>
            )}

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </motion.div>

          {/* Right Column - Information */}
          <motion.div
            {...motionPresets.fadeInUp}
            transition={{ delay: 0.15 }}
            className="space-y-5"
          >
            <InfoCard />
            <QuickTipsCard />
          </motion.div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={result}
        imagePreview={imagePreview}
      />

      {/* Loading Analysis Overlay */}
      <AnimatePresence>
        {isAnalyzing && <LoadingAnalysis />}
      </AnimatePresence>
    </div>
  );
}

/**
 * Upload Zone Component
 * Drag-drop area with tactile feedback
 */
function UploadZone({ isDragging, onDragOver, onDragLeave, onDrop, onClickUpload, onClickCamera }) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <motion.div
      className={cn(
        'relative rounded-xl border-2 border-dashed transition-all duration-300',
        'bg-white dark:bg-[#1A1A1A]',
        'min-h-[400px] flex flex-col items-center justify-center',
        'cursor-pointer group',
        isDragging 
          ? 'border-[#3B6D11] bg-[#EEF4E8] dark:bg-[#3B6D11]/10 scale-[1.02]'
          : 'border-stone-300 hover:border-[#3B6D11]/50 hover:bg-[#EEF4E8]/30'
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClickUpload}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Upload Icon with Animation */}
      <motion.div
        className={cn(
          'p-6 rounded-full mb-6 transition-all duration-300',
          isDragging 
            ? 'bg-[#3B6D11] shadow-[0_8px_24px_rgba(59,109,17,0.25)]'
            : 'bg-[#EEF4E8] group-hover:bg-[#3B6D11] group-hover:shadow-[0_8px_24px_rgba(59,109,17,0.2)]'
        )}
        animate={isDragging ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Upload 
          className={cn(
            'w-12 h-12 transition-colors duration-300',
            isDragging 
              ? 'text-white' 
              : 'text-[#3B6D11] group-hover:text-white'
          )} 
        />
      </motion.div>

      {/* Instructions */}
      <h3 className={cn(
        tastePatterns.typography.h4,
        'mb-2 transition-colors duration-300',
        isDragging && 'text-[#3B6D11]'
      )}>
        {isDragging ? 'Drop image here' : 'Upload Plant Photo'}
      </h3>
      
      <p className={cn(tastePatterns.typography.caption, 'mb-6 text-center max-w-xs')}>
        {isDragging 
          ? 'Release to upload your image'
          : 'Drag and drop an image, or click to browse'
        }
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClickUpload();
          }}
          className={cn(
            tastePatterns.farmerButton.primary,
            'flex items-center gap-2'
          )}
          whileTap={{ scale: 0.98 }}
        >
          <FileImage className="w-5 h-5" />
          Choose File
        </motion.button>

        {isMobile && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onClickCamera();
            }}
            className={cn(
              tastePatterns.farmerButton.outline,
              'flex items-center gap-2'
            )}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </motion.button>
        )}
      </div>

      {/* File Format Info */}
      <p className="text-xs text-stone-500 mt-6">
        Supports JPG, PNG, WebP • Max 10MB
      </p>
    </motion.div>
  );
}

/**
 * Image Preview Component
 * Shows uploaded image with clear option
 */
function ImagePreview({ preview, onClear, isAnalyzing }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] shadow-[0_4px_16px_rgba(59,109,17,0.12)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-800">
        <img
          src={preview}
          alt="Plant preview"
          className="w-full h-full object-contain"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Clear Button */}
      {!isAnalyzing && (
        <motion.button
          onClick={onClear}
          className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-black transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-5 h-5 text-[#1A1A1A] dark:text-white" />
        </motion.button>
      )}

      {/* Image Info Bar */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#3B6D11]" />
            <span className={tastePatterns.typography.label}>
              Ready to Analyze
            </span>
          </div>
          <span className="text-sm text-stone-500">
            Image loaded
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Info Card Component
 */
function InfoCard() {
  return (
    <div className={cn(
      tastePatterns.earthyCard.base,
      tastePatterns.earthyCard.dark
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[#0D4A6B]/10">
          <Info className="w-5 h-5 text-[#0D4A6B]" />
        </div>
        <div>
          <h3 className={tastePatterns.typography.h4}>How It Works</h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <Step number="1" text="Upload a clear photo of the affected plant" />
        <Step number="2" text="Our AI analyzes the image for disease patterns" />
        <Step number="3" text="Get instant diagnosis with confidence score" />
        <Step number="4" text="Follow remediation steps to treat the disease" />
      </div>
    </div>
  );
}

function Step({ number, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3B6D11] text-white text-sm font-semibold flex items-center justify-center">
        {number}
      </div>
      <p className="text-sm text-[#4A4A4A] dark:text-stone-300 leading-relaxed pt-0.5">
        {text}
      </p>
    </div>
  );
}

/**
 * Quick Tips Card
 */
function QuickTipsCard() {
  const tips = [
    'Ensure good lighting when taking photos',
    'Focus on affected leaves or stems',
    'Take photos from multiple angles if needed',
    'Avoid blurry or dark images'
  ];

  return (
    <div className={cn(
      tastePatterns.earthyCard.base,
      tastePatterns.earthyCard.dark
    )}>
      <h3 className={cn(tastePatterns.typography.h4, 'mb-4')}>
        📸 Photo Tips
      </h3>
      
      <ul className="space-y-2.5">
        {tips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2"
          >
            <ArrowRight className="w-4 h-4 text-[#3B6D11] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#4A4A4A] dark:text-stone-300">
              {tip}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Result Modal Component
 * Morphing modal with disease details
 */
function ResultModal({ isOpen, onClose, result, imagePreview }) {
  if (!result) return null;

  const confidenceColor = result.confidence >= 80 
    ? '#3B6D11' 
    : result.confidence >= 60 
      ? '#D97706' 
      : '#B45309';

  const severityConfig = {
    low: { color: '#3B6D11', label: 'Low Severity' },
    moderate: { color: '#D97706', label: 'Moderate Severity' },
    high: { color: '#B45309', label: 'High Severity' }
  };

  const severity = severityConfig[result.severity] || severityConfig.moderate;

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <Modal.Header title="Disease Detection Results" onClose={onClose} />
      
      <Modal.Body>
        <div className="space-y-6">
          {/* Image Preview */}
          {imagePreview && (
            <div className="aspect-video rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
              <img
                src={imagePreview}
                alt="Analyzed plant"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Disease Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={tastePatterns.typography.h3}>
                {result.disease}
              </h3>
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: severity.color }}
              >
                {severity.label}
              </span>
            </div>

            {/* Confidence Meter */}
            <ConfidenceMeter confidence={result.confidence} color={confidenceColor} />
          </div>

          {/* Remediation Steps */}
          <div>
            <h4 className={cn(tastePatterns.typography.h4, 'mb-4')}>
              Remediation Steps
            </h4>
            <div className="space-y-3">
              {result.remediation.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#EEF4E8] dark:bg-[#3B6D11]/10"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3B6D11] text-white text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="text-sm text-[#1A1A1A] dark:text-stone-200 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Warning Note */}
          {result.confidence < 70 && (
            <div className={tastePatterns.alert.warning}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#1A1A1A]">Low Confidence Detection</h4>
                  <p className="text-sm mt-1 text-[#4A4A4A]">
                    The AI is uncertain about this diagnosis. Consider consulting an agricultural expert for confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={onClose}
          variant="outline"
          className={tastePatterns.farmerButton.outline}
        >
          Close
        </Button>
        <Button
          onClick={() => window.print()}
          className={tastePatterns.farmerButton.primary}
        >
          Save Results
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Confidence Meter Component
 * Visual representation of AI confidence
 */
function ConfidenceMeter({ confidence, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={tastePatterns.typography.label}>
          Confidence Score
        </span>
        <span className="font-bold text-[#1A1A1A] dark:text-white">
          {confidence}%
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/**
 * Loading Analysis Overlay
 * Skeleton matching result layout
 */
function LoadingAnalysis() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-[#1A1A1A] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="text-center">
          {/* Animated Icon */}
          <motion.div
            className="inline-block p-4 rounded-full bg-[#3B6D11]/10 mb-4"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12 text-[#3B6D11]" />
          </motion.div>

          <h3 className={cn(tastePatterns.typography.h3, 'mb-2')}>
            Analyzing Plant
          </h3>
          
          <p className={cn(tastePatterns.typography.body, 'mb-6')}>
            Our AI is examining your image for disease patterns...
          </p>

          {/* Loading Steps */}
          <div className="space-y-3 text-left">
            <LoadingStep text="Processing image" delay={0} />
            <LoadingStep text="Detecting disease patterns" delay={0.5} />
            <LoadingStep text="Calculating confidence score" delay={1} />
            <LoadingStep text="Generating recommendations" delay={1.5} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoadingStep({ text, delay }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-[#3B6D11]"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, delay }}
      />
      <span className="text-sm text-[#4A4A4A] dark:text-stone-300">
        {text}
      </span>
    </motion.div>
  );
}

export default PlantScanner;
