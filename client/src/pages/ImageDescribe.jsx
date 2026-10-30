import React, { useState } from 'react';
import {
  Eye,
  Upload,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileText,
  Volume2,
  Languages,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import ResultCard from '../components/ResultCard';
import api from '../services/api';

const ALL_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function ImageDescribe() {
  const { s } = useA11y();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [language, setLanguage] = useState(s.preferredLanguage || 'English');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WebP, GIF).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  // Helper to load sample test image for judges
  const loadSampleImage = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    if (type === 'transit') {
      // Draw a transit diagram
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 600, 360);
      ctx.fillStyle = '#0F766E';
      ctx.fillRect(40, 40, 520, 60);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('METRO LINE 1 - AIRPORT TO CENTRAL', 60, 78);

      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(80, 200);
      ctx.lineTo(520, 200);
      ctx.stroke();

      const stops = ['Airport', 'Guindy', 'T.Nagar', 'Central'];
      stops.forEach((stop, i) => {
        const x = 80 + i * 140;
        ctx.fillStyle = '#FFEB3B';
        ctx.beginPath();
        ctx.arc(x, 200, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(stop, x - 25, 240);
      });
    } else {
      // Draw a hospital prescription label
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 600, 360);
      ctx.fillStyle = '#0F766E';
      ctx.fillRect(0, 0, 600, 50);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('APOLLO HEALTH CLINIC - PRESCRIPTION', 24, 34);

      ctx.fillStyle = '#0F172A';
      ctx.font = '16px sans-serif';
      ctx.fillText('Patient: S. Sharma | Age: 42 | Date: 30-Oct-2026', 24, 90);
      ctx.fillText('Rx: Metoprolol 50mg Tablet', 24, 130);
      ctx.fillText('Directions: Take 1 tablet by mouth twice daily with meals.', 24, 160);
      ctx.fillText('Refills: 2 | Warning: Do not discontinue abruptly.', 24, 190);
      ctx.fillStyle = '#E11D48';
      ctx.fillText('EMERGENCY: Contact clinic if pulse < 50 bpm.', 24, 230);
    }

    canvas.toBlob((blob) => {
      const file = new File([blob], `${type}-sample.png`, { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose an image file to describe.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('language', language);

    try {
      setIsLoading(true);
      setError('');
      setResult(null);

      const res = await api.post('/ai/describe-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.result) {
        setResult(res.data.result);
      } else {
        setError('We could not describe this image. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to describe image. Please check your network and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Image & Scene Describer</h2>
        <p className="mt-1 text-muted text-base leading-relaxed">
          Upload any photo, transit chart, flyer, or diagram. AccessBridge produces screen-reader alt
          text, detailed scene descriptions for blind users, and OCR text readout in your chosen language.
        </p>
      </header>

      {/* Main Upload Card */}
      <section className="card space-y-6" aria-labelledby="image-input-heading">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection Toolbar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="language-options"
                className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5"
              >
                <Languages size={15} className="text-brand-700" aria-hidden="true" />
                <span>Description Language:</span>
              </label>

              {/* Sample Buttons for Demo/Judges */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted hidden sm:inline">Try Sample:</span>
                <button
                  type="button"
                  onClick={() => loadSampleImage('transit')}
                  className="btn-ghost !min-h-[38px] !px-2.5 text-xs text-brand-700 hover:bg-brand-100"
                >
                  Metro Diagram
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleImage('prescription')}
                  className="btn-ghost !min-h-[38px] !px-2.5 text-xs text-brand-700 hover:bg-brand-100"
                >
                  Prescription Note
                </button>
              </div>
            </div>

            <div id="language-options" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ALL_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`btn-ghost !min-h-[44px] !px-3 text-xs flex flex-col items-center justify-center ${
                    language === lang.id
                      ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={language === lang.id}
                >
                  <span className="text-sm font-semibold">{lang.native}</span>
                  <span className="text-[10px] opacity-80">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Drop Zone / Preview */}
          <div className="rounded-2xl border-2 border-dashed border-line bg-surface p-8 text-center space-y-4">
            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt={result?.altText || 'Uploaded image preview'}
                  className="max-h-72 mx-auto rounded-xl object-contain border border-line shadow-soft"
                />
                <p className="text-xs text-muted">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
                <div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label htmlFor="image-upload" className="btn-ghost !min-h-[40px] text-xs cursor-pointer">
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon size={40} className="mx-auto text-muted" aria-hidden="true" />
                <div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label htmlFor="image-upload" className="btn-primary cursor-pointer !min-h-[44px]">
                    Select Image to Describe
                  </label>
                </div>
                <p className="text-xs text-muted">
                  Supports PNG, JPG, JPEG, WEBP, GIF up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="btn-primary w-full text-base !min-h-[48px]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
            ) : (
              <Sparkles size={20} aria-hidden="true" />
            )}
            <span>
              {isLoading
                ? `Analyzing image in ${language}…`
                : `Generate Assistive Description (${language})`}
            </span>
          </button>
        </form>
      </section>

      {/* Screen Readers Live Region */}
      <div aria-live="polite" aria-busy={isLoading} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
          >
            <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={20} aria-hidden="true" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* AI Results */}
        {result && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <CheckCircle2 size={20} className="text-brand-700" aria-hidden="true" />
              <span className="font-bold text-brand-700 text-sm">
                Visual Analysis Complete ({language})
              </span>
            </div>

            {/* 1. Concise Alt-Text */}
            {result.altText && (
              <ResultCard
                title="Screen Reader Alt-Text"
                text={result.altText}
                lang={language}
              />
            )}

            {/* 2. Detailed Scene Description */}
            {result.detailedDescription && (
              <ResultCard
                title="Detailed Scene Description for Blind Users"
                text={result.detailedDescription}
                lang={language}
              />
            )}

            {/* 3. OCR Text */}
            {result.detectedText && (
              <ResultCard
                title="Detected Text in Image (OCR)"
                text={result.detectedText}
                lang={language}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
