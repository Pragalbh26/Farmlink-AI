import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ImageUpload } from '../components/marketplace/ImageUpload';
import { DiseaseResultCard } from '../components/disease/DiseaseResultCard';
import { AIStateCard } from '../components/common/AIStateCard';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';

export const DiseaseDetection = () => {
  const { t } = useLanguage();
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [aiState, setAiState] = useState('empty');
  const [inferenceError, setInferenceError] = useState('');

  const handleImageSelected = async (dataUrl, fileName) => {
    setImagePreview(dataUrl);
    if (!dataUrl) {
      setResult(null);
      setInferenceError('');
      setAiState('empty');
      return;
    }

    setAiState('loading');
    setInferenceError('');

    try {
      const formData = new FormData();
      const blob = await fetch(dataUrl).then((r) => r.blob());
      formData.append('image', blob, fileName || 'leaf.jpg');

      const res = await apiClient.request('/disease/predict', {
        method: 'POST',
        body: formData,
      });

      const payload = res?.data && typeof res.data === 'object' ? res.data : null;

      if (res?.success && payload) {
        setResult(payload);
        if (payload.status === 'uncertain') {
          setAiState('uncertain');
        } else if (payload.status === 'unsupported') {
          setAiState('unsupported');
        } else {
          setAiState('success');
        }
      } else {
        setInferenceError('The server returned an empty diagnosis response. Please restart Django and try again.');
        setAiState('error');
      }
    } catch (err) {
      setInferenceError(err?.message || 'Unable to reach the crop diagnostics service.');
      setAiState('error');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setInferenceError('');
    setAiState('empty');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            AI Vision Diagnostics
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            FarmLink CV Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('disease_detection')} &amp; Diagnostics
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Upload or capture a clear photo of a crop leaf to identify potential diseases and view ICAR-recommended management steps.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <ImageUpload
          label="Leaf Image Input (Camera / Gallery)"
          helperText="Position a single leaf clearly in bright, natural daylight without shadow"
          previewUrl={imagePreview}
          onImageSelected={handleImageSelected}
        />
      </Card>

      {aiState === 'loading' && (
        <AIStateCard
          state="loading"
          message="Analyzing leaf image and evaluating disease confidence..."
        />
      )}

      {aiState === 'empty' && (
        <AIStateCard
          state="empty"
          title="No Leaf Image Selected"
          message="Upload or capture a clear crop leaf photo above to run real-time disease classification."
        />
      )}

      {aiState === 'uncertain' && result && (
        <div className="space-y-4">
          <AIStateCard
            state="uncertain"
            title={`Low Confidence Classification: ${result.crop} (${Math.round((result.confidence || 0) * 100)}%)`}
            message="Visual features are unclear or lighting is uneven. Retake the photo in bright natural light for a clearer result."
            actionText="Retake Photo"
            onAction={handleReset}
          />
          <DiseaseResultCard result={result} />
        </div>
      )}

      {aiState === 'unsupported' && result && (
        <AIStateCard
          state="unsupported"
          title="Unsupported Crop Species"
          message={result.symptoms}
          actionText="Upload Another Leaf"
          onAction={handleReset}
        />
      )}

      {aiState === 'error' && (
        <AIStateCard
          state="error"
          title="Diagnostics Service Error"
          message={inferenceError || 'Unable to process this image right now.'}
          onRetry={handleReset}
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