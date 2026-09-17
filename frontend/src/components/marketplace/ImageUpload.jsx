import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export const ImageUpload = ({
  onImageSelected,
  previewUrl,
  label,
  helperText,
  accept = 'image/*',
  presetSamples = []
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onImageSelected) {
          onImageSelected(e.target.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2.5">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-56 sm:h-64 object-cover transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-4">
            <span className="text-xs font-semibold text-white bg-emerald-700/80 px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Image Loaded
            </span>
            <button
              type="button"
              onClick={() => onImageSelected(null, null)}
              className="p-2 bg-rose-600/90 text-white rounded-xl hover:bg-rose-700 transition cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">{t('upload_photo')}</p>
            <p className="text-xs text-slate-500">{helperText || t('drag_drop_photo')}</p>
          </div>
          <Button variant="secondary" size="sm" icon={UploadCloud}>
            Browse Files or Camera
          </Button>
        </div>
      )}

      {/* Preset demo sample picker for rapid testing without external files */}
      {presetSamples.length > 0 && !previewUrl && (
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-500 mb-2">Or select a test leaf sample:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presetSamples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onImageSelected(sample.url, sample.name)}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white text-left hover:bg-emerald-50/30 transition text-xs cursor-pointer"
              >
                <span className="text-base">{sample.emoji || '🍃'}</span>
                <span className="font-medium text-slate-700 truncate">{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
