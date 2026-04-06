import React, { useRef, useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';

export default function CropHealthScanner({ onImageSelect, isLoading }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const dragZoneRef = useRef(null);

  const handleImageProcessing = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onImageSelect(file);
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

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!preview ? (
        <div className="space-y-3">
          {/* Drag & Drop Zone */}
          <div
            ref={dragZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-brand/50 transition-colors"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-brand/60" />
            <p className="text-sm font-medium text-neutral-200">Drag crop image here</p>
            <p className="text-xs text-neutral-400 mt-1">or use buttons below</p>
          </div>

          {/* File & Camera Inputs */}
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
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Browse Files
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              className="bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img
              src={preview}
              alt="Crop preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={clearPreview}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-neutral-900/80 hover:bg-neutral-900 p-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-neutral-300" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              Analyzing crop health...
            </div>
          )}

          {/* Change Image */}
          {!isLoading && (
            <button
              onClick={clearPreview}
              className="w-full bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 border border-neutral-700/50 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              Change Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}
