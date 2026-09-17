import React, { useState } from 'react';
import {
  ScanLine,
  Camera,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ImageUpload } from '../components/marketplace/ImageUpload';
import { DiseaseResultCard } from '../components/disease/DiseaseResultCard';
import { AIStateCard } from '../components/common/AIStateCard';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { mockDiseaseCatalogue } from '../api/mockData';

export const DiseaseDetection = () => {
  const { t } = useLanguage();

  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [aiState, setAiState] = useState('empty'); // 'empty' | 'loading' | 'success' | 'uncertain' | 'unsupported' | 'error'

  const demoSamples = [
    {
      name: 'Tomato (Early Blight)',
      emoji: '🍅',
      type: 'Tomato',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Potato (Late Blight)',
      emoji: '🥔',
      type: 'Potato',
      url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Pepper (Low Confidence Test)',
      emoji: '🫑',
      type: 'Pepper Bell',
      url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80'
    },
    {
      name: 'Sugarcane (Unsupported Test)',
      emoji: '🎋',
      type: 'Sugarcane',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const handleImageSelected = async (url, sampleName) => {
    setImagePreview(url);
    if (!url) {
      setResult(null);
      setAiState('empty');
      return;
    }

    // Determine sample type
    const matchedSample = demoSamples.find(s => s.name === sampleName);
    const sampleType = matchedSample ? matchedSample.type : 'Tomato';

    setAnalyzing(true);
    setAiState('loading');

    try {
      const res = await apiClient.request('/disease/predict', {
        method: 'POST',
        body: { sampleType }
      });

      if (res.success) {
        setResult(res.data);
        if (res.data.status === 'uncertain') {
          setAiState('uncertain');
        } else if (res.data.status === 'unsupported') {
          setAiState('unsupported');
        } else {
          setAiState('success');
        }
      }
    } catch (err) {
      setAiState('error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setAiState('empty');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            Computer Vision Classifier
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Backbone: MobileNetV2 Transfer Learning
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('disease_detection')} & Diagnostics
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Capture or upload a clear leaf photo to receive preliminary AI disease classification and ICAR/KVK-approved cultural management advice.
        </p>
      </div>

      {/* Upload Box & Tester */}
      <Card className="p-6 space-y-4">
        <ImageUpload
          label="Leaf Image Input (Camera / Gallery)"
          helperText="Position a single leaf clearly in bright, natural daylight without finger shadow"
          previewUrl={imagePreview}
          onImageSelected={handleImageSelected}
          presetSamples={demoSamples}
        />
      </Card>

      {/* 4 Standard AI States */}
      {aiState === 'loading' && (
        <AIStateCard
          state="loading"
          message="Running MobileNetV2 neural inference & calculating confidence boundaries..."
        />
      )}

      {aiState === 'empty' && (
        <AIStateCard
          state="empty"
          title="No Leaf Image Selected"
          message="Upload a leaf photo or pick one of the test samples above to trigger real-time disease classification."
        />
      )}

      {aiState === 'uncertain' && result && (
        <div className="space-y-4">
          <AIStateCard
            state="uncertain"
            title={`Uncertain Classification: ${result.crop} (${Math.round(result.confidence * 100)}% Confidence)`}
            message="The neural network confidence score is below our safe clinical decision threshold (80%). Leaf visual features are ambiguous or lighting may be uneven."
            actionText="Retake Photo with Clean Lighting"
            onAction={handleReset}
          />
          <DiseaseResultCard result={result} />
        </div>
      )}

      {aiState === 'unsupported' && result && (
        <div className="space-y-4">
          <AIStateCard
            state="unsupported"
            title="Unsupported Crop Species"
            message={result.symptoms}
            actionText="Upload a Supported Crop"
            onAction={handleReset}
          />
        </div>
      )}

      {aiState === 'error' && (
        <AIStateCard
          state="error"
          title="Inference Service Error"
          message="Failed to process image through the vision container."
          onRetry={() => handleImageSelected(imagePreview, 'Tomato')}
        />
      )}

      {aiState === 'success' && result && (
        <div className="space-y-6">
          <DiseaseResultCard result={result} />

          <div className="flex justify-end">
            <Button variant="outline" size="md" onClick={handleReset} icon={RefreshCw}>
              Analyze Another Crop Leaf
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
