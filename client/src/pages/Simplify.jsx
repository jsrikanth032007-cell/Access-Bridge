import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import api from '../services/api.js';
import {
  FileText,
  Upload,
  Globe,
  CheckCircle2,
  ListOrdered,
  BookOpen,
  Languages,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Volume2,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton } from '../components/SpeechControls.jsx';

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'];
const READING_LEVELS = ['Simple', 'Very Simple', 'Original'];

export default function Simplify() {
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  // Input tabs: 'text' | 'file' | 'url'
  const [activeTab, setActiveTab] = useState('text');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Profile-backed options
  const [readingLevel, setReadingLevel] = useState(settings.readingLevel || 'Simple');
  const [language, setLanguage] = useState(settings.preferredLanguage || 'English');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['application/pdf', 'text/plain'].includes(file.type)) {
        setError('Please upload a valid .pdf or .txt file.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Form data for multipart upload or json
    const formData = new FormData();
    formData.append('readingLevel', readingLevel);
    formData.append('language', language);

    if (activeTab === 'text') {
      if (!inputText.trim()) {
        setError('Please enter or paste the text you want to simplify.');
        return;
      }
      formData.append('text', inputText.trim());
    } else if (activeTab === 'url') {
      if (!inputUrl.trim()) {
        setError('Please enter a website URL.');
        return;
      }
      formData.append('url', inputUrl.trim());
    } else if (activeTab === 'file') {
      if (!selectedFile) {
        setError('Please select a .pdf or .txt document to upload.');
        return;
      }
      formData.append('file', selectedFile);
    }

    try {
      setIsLoading(true);
      const res = await api.post('/ai/simplify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setResult(res.data.result);

        // Auto read aloud if enabled in user profile
        if (settings.autoReadAloud && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(res.data.result.plainLanguage);
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to simplify content. Please check your network and try again.'
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

  const handleAskAssistant = () => {
    if (result) {
      navigate('/voice-assistant', {
        state: { context: result.plainLanguage },
      });
    }
  };

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Page Title & Help */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Assistive Simplifier</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Content Simplifier
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Paste complex notices, upload PDFs, or enter URLs. AccessBridge translates dense jargon
          into plain language, highlights action items, explains tough terms, and provides regional
          translations.
        </p>
      </div>

      {/* Input Options Card */}
      <section
        aria-label="Input Content Form"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
      >
        {/* Method Tabs */}
        <div
          role="tablist"
          aria-label="Select input format"
          className="flex border-b border-slate-200 dark:border-slate-800 space-x-4"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'text'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Paste Text</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
            className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'file'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Upload Document (.pdf, .txt)</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'url'}
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'url'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span>Web Page URL</span>
          </button>
        </div>

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
          {/* Tab 1: Paste Text */}
          {activeTab === 'text' && (
            <div>
              <label
                htmlFor="input-text"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
              >
                Paste your complex text, medical bill, or legal document here:
              </label>
              <textarea
                id="input-text"
                rows="6"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. In accordance with Section 4(b), the tenant shall indemnify and hold harmless the landlord against any claims, losses, or liabilities resulting from accidental water damage..."
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
              />
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === 'file' && (
            <div>
              <label
                htmlFor="file-upload"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
              >
                Choose a PDF or plain text (.txt) file:
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm cursor-pointer shadow-sm transition-colors"
                  >
                    Browse Document
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedFile
                    ? `Selected file: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                    : 'Supports PDF & TXT up to 10MB'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: URL */}
          {activeTab === 'url' && (
            <div>
              <label
                htmlFor="input-url"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
              >
                Enter the web URL to extract and simplify:
              </label>
              <input
                id="input-url"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.gov/voter-registration-guide"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
              />
            </div>
          )}

          {/* Profile Overrides / Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <label
                htmlFor="simplify-reading-level"
                className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1"
              >
                Target Reading Level
              </label>
              <select
                id="simplify-reading-level"
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {READING_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Level
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="simplify-language"
                className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1"
              >
                Translate Summary Into
              </label>
              <select
                id="simplify-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner message="Gemini AI is simplifying your content..." size="sm" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Simplify Content Now</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* AI Result Section */}
      {result && (
        <section
          aria-live="polite"
          aria-label="Simplification Results"
          className="space-y-6 pt-4 animate-fadeIn"
        >
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Simplification Complete ({readingLevel} Level • {language})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <TTSButton
                text={`${result.plainLanguage}. Key points: ${result.keyPoints.join('. ')}`}
                language={language === 'English' ? 'English' : language}
                label="Listen to All"
              />
              <button
                onClick={handleAskAssistant}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                aria-label="Ask questions about this simplified document with voice assistant"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>Ask Voice Assistant</span>
              </button>
            </div>
          </div>

          {/* (a) Plain Language Version */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" aria-hidden="true" />
                <span>Plain Language Version</span>
              </h2>
              <div className="flex items-center gap-2">
                <TTSButton text={result.plainLanguage} language={language} label="Read" />
                <button
                  onClick={() => handleCopy(result.plainLanguage, 'plain')}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  title="Copy plain language text"
                  aria-label="Copy plain language text"
                >
                  {copiedKey === 'plain' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line text-base">
              {result.plainLanguage}
            </div>
          </div>

          {/* (b) 3-Bullet Key Points */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <span>3-Bullet Key Takeaways</span>
            </h2>

            <ul className="space-y-3">
              {result.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex items-start gap-3 text-base"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* (c) What should I do next? Action Steps */}
          {result.actionSteps && result.actionSteps.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-amber-500" aria-hidden="true" />
                <span>What Should I Do Next? (Action Steps)</span>
              </h2>

              <div className="space-y-2">
                {result.actionSteps.map((step, idx) => (
                  <label
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-base text-slate-800 dark:text-slate-200">{step}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* (d) Glossary of Difficult Words */}
          {result.glossary && result.glossary.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" aria-hidden="true" />
                <span>Difficult Words Glossary</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.glossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-1"
                  >
                    <span className="font-bold text-purple-900 dark:text-purple-300 text-sm block">
                      {item.term}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* (e) Translation */}
          {result.translation && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Languages className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <span>Translation ({language})</span>
                </h2>
                <TTSButton text={result.translation} language={language} label="Read Translation" />
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line text-base">
                {result.translation}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
