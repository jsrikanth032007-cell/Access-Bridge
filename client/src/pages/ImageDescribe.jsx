import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { useTTS } from '../hooks/useTTS.js';
import api from '../services/api.js';
import {
  Eye,
  Upload,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Volume2,
  Image as ImageIcon,
  Languages,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton } from '../components/SpeechControls.jsx';

const ALL_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function ImageDescribe() {
  const { settings } = useAccessibility();
  const { speak } = useTTS();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [language, setLanguage] = useState(settings.preferredLanguage || 'English');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

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
      const res = await api.post('/ai/describe-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResult(res.data.result);

        // Auto read aloud if enabled in profile or blind accessibility mode
        if ((settings.autoReadAloud || settings.blindAccessibilityMode)) {
          const textToSpeak = `${res.data.result.altText}. ${res.data.result.detailedDescription}`;
          speak(textToSpeak, language);
        }
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

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Assistive Vision & OCR</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Image & Scene Describer
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Upload any picture, transit diagram, flyer, or infographic. Gemini AI produces concise
          screen-reader alt-text, an in-depth spatial description for blind users, and transcribes
          all text detected within the image in your preferred language.
        </p>
      </div>

      {/* Upload Form */}
      <section
        aria-label="Upload Image for Assistive Description"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
      >
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <label
              htmlFor="image-language-select"
              className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Languages className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Describe Image in Language:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ALL_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    language === lang.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                  aria-pressed={language === lang.id}
                >
                  <span className="text-sm">{lang.native}</span>
                  <span className="text-[10px] opacity-80">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-800/40">
            {previewUrl ? (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt={result?.altText || 'Uploaded image preview for analysis'}
                  className="max-h-72 mx-auto rounded-xl object-contain border-2 border-brand-500 shadow-sm"
                />
                <p className="text-xs text-slate-500">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
                <div>
                  <input
                    id="image-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="image-file-input"
                    className="inline-block px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-300"
                  >
                    Change Image
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" aria-hidden="true" />
                <div>
                  <input
                    id="image-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="image-file-input"
                    className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm cursor-pointer shadow-sm transition-colors"
                  >
                    Select Image to Describe
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports PNG, JPG, JPEG, WEBP up to 10MB
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner message={`Gemini AI vision is analyzing the image in ${language}...`} size="sm" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Generate Assistive Vision Description ({language})</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* AI Result Section */}
      {result && (
        <section
          aria-live="polite"
          aria-label="Image Description Results"
          className="space-y-6 pt-4 animate-fadeIn"
        >
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
              Visual Analysis Ready ({language})
            </span>
            <TTSButton
              text={`${result.altText}. ${result.detailedDescription}. ${result.detectedText}`}
              language={language}
              label={`Listen in ${language}`}
            />
          </div>

          {/* (1) Screen Reader Alt-Text */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-600" aria-hidden="true" />
                <span>Concise Alt-Text (Screen Reader Ready)</span>
              </h2>
              <div className="flex items-center gap-2">
                <TTSButton text={result.altText} language={language} label="Read" />
                <button
                  onClick={() => handleCopy(result.altText, 'alt')}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-xs font-semibold"
                  aria-label="Copy concise alt text"
                >
                  {copiedKey === 'alt' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 text-slate-900 dark:text-white font-medium text-base">
              "{result.altText}"
            </div>
          </div>

          {/* (2) Detailed Visual Walkthrough */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <span>Detailed Scene Description for Blind Users</span>
              </h2>
              <TTSButton text={result.detailedDescription} language={language} label={`Read Description (${language})`} />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line text-base">
              {result.detailedDescription}
            </div>
          </div>

          {/* (3) Detected OCR Text */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" aria-hidden="true" />
                <span>Detected Text in Image (OCR)</span>
              </h2>
              <TTSButton text={result.detectedText} language={language} label="Read Detected Text" />
            </div>

            <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
              {result.detectedText}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
