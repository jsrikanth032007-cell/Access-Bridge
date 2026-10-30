import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  FileText,
  Upload,
  Globe,
  Mic,
  MicOff,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  BookMarked,
  ArrowRight,
} from 'lucide-react';
import ResultCard from '../components/ResultCard';
import { useA11y } from '../context/AccessibilityContext';
import { useSpeech } from '../hooks/useSpeech';
import api from '../services/api';

const LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const READING_LEVELS = [
  { id: 'Simple', label: 'Simple (Clear & direct)' },
  { id: 'Very Simple', label: 'Very Simple (Plain words, short sentences)' },
  { id: 'Original', label: 'Original (Light edit only)' },
];

const DEMO_SAMPLES = [
  {
    name: 'Tamil Govt Notice',
    lang: 'Tamil',
    text: `தமிழ்நாடு அரசு மாற்றுத்திறனாளிகள் நலத்துறை அரசாணை எண் 42/2024: அனைத்து மாற்றுத்திறனாளிகளும் தனித்துவ அடையாள அட்டை (UDID) பெறுவது கட்டாயமாக்கப்பட்டுள்ளது. இந்த அட்டையின் மூலம் அரசுப் பேருந்துகளில் 100% இலவச பயணம், மாதாந்திர பராமரிப்பு உதவித்தொகை ரூ.2,000, மற்றும் கல்வி உதவித்தொகை நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படும். தகுதியுடைய நபர்கள் தங்களின் மருத்துவச் சான்றிதழ், ஆதார் அட்டை, ரேஷன் அட்டை மற்றும் இருப்பிடச் சான்றுடன் அருகிலுள்ள இ-சேவை மையத்தில் 30 நாட்களுக்குள் விண்ணப்பிக்க வேண்டும். சந்தேகங்களுக்கு 1800-425-0111 என்ற இலவச தொலைபேசி எண்ணை அழைக்கலாம்.`,
  },
  {
    name: 'Legal Lease Agreement',
    lang: 'English',
    text: `Section 14(c) Indemnification and Liability: The Tenant covenants to indemnify, defend, and hold harmless the Landlord, its agents, and employees against any and all liabilities, damages, claims, or expenses, including reasonable attorney fees, arising out of any occurrence upon the leased premises occasioned wholly or in part by any act or omission of the Tenant. Failure to remit monthly dues within five consecutive calendar days of the due date shall incur a mandatory liquidated statutory surcharge of fifteen percent compounded bi-weekly.`,
  },
  {
    name: 'Hospital Discharge Summary',
    lang: 'English',
    text: `Patient diagnosed with acute post-operative hypertension secondary to mild renal insufficiency. Strict adherence to pharmacotherapy mandated: Metoprolol tartrate 50mg b.i.d. per os postprandial; avoid NSAIDs due to nephrotoxic potential. Daily sodium restriction <1500mg. Schedule mandatory follow-up nephrology consultation within 7 days. Report immediately to emergency department if systolic BP exceeds 160 mmHg, or if experiencing peripheral edema or acute dyspnea.`,
  },
];

export default function Simplify() {
  const { s } = useA11y();
  const navigate = useNavigate();

  // Input states
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file' | 'url'
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Settings
  const [readingLevel, setReadingLevel] = useState(s.readingLevel || 'Simple');
  const [language, setLanguage] = useState(s.preferredLanguage || 'English');

  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Voice dictation hook
  const {
    isListening,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    changeLanguage,
  } = useSpeech({
    language,
    onResult: (spokenText) => {
      setText((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    },
  });

  useEffect(() => {
    if (changeLanguage) {
      changeLanguage(language);
    }
  }, [language, changeLanguage]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['application/pdf', 'text/plain'].includes(file.type)) {
        setError('Please upload a valid .pdf or .txt document.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const loadSample = (sample) => {
    setActiveTab('text');
    setText(sample.text);
    if (sample.lang) setLanguage(sample.lang);
    setError('');
    setData(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    const formData = new FormData();
    formData.append('readingLevel', readingLevel);
    formData.append('language', language);

    if (activeTab === 'text') {
      if (!text.trim()) {
        setError('Please enter or paste the text you want to simplify.');
        setLoading(false);
        return;
      }
      formData.append('text', text.trim());
    } else if (activeTab === 'url') {
      if (!url.trim()) {
        setError('Please enter a website URL.');
        setLoading(false);
        return;
      }
      formData.append('url', url.trim());
    } else if (activeTab === 'file') {
      if (!selectedFile) {
        setError('Please select a .pdf or .txt file to upload.');
        setLoading(false);
        return;
      }
      formData.append('file', selectedFile);
    }

    try {
      const res = await api.post('/ai/simplify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.result) {
        const raw = res.data.result;
        setData({
          plainVersion: raw.plainLanguage || raw.plainVersion || '',
          keyPoints: raw.keyPoints || [],
          nextSteps: raw.actionSteps || raw.nextSteps || [],
          glossary: raw.glossary || [],
          translation:
            typeof raw.translation === 'object' && raw.translation !== null
              ? raw.translation
              : {
                  language: res.data.language || language,
                  text: raw.translation || '',
                },
          warnings: raw.warnings || [],
        });
      } else {
        setError('We could not process this right now. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We could not process this right now. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAskAssistant = () => {
    if (data?.plainVersion) {
      navigate('/voice', {
        state: { context: data.plainVersion },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Simplify any content</h2>
        <p className="mt-1 text-muted text-base leading-relaxed">
          Paste a notice, form, or article. We make it clear, short, and translated.
        </p>
      </header>

      {/* Main Input Card */}
      <section className="card space-y-6" aria-labelledby="input-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          {/* Format Tabs */}
          <div
            role="tablist"
            aria-label="Input options"
            className="flex items-center gap-2 overflow-x-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'text'}
              onClick={() => setActiveTab('text')}
              className={`btn-ghost !min-h-[44px] !px-4 text-sm font-semibold ${
                activeTab === 'text'
                  ? 'bg-brand-100 text-brand-700 border-brand-600'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <FileText size={18} aria-hidden="true" />
              <span>Paste Text</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'file'}
              onClick={() => setActiveTab('file')}
              className={`btn-ghost !min-h-[44px] !px-4 text-sm font-semibold ${
                activeTab === 'file'
                  ? 'bg-brand-100 text-brand-700 border-brand-600'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Upload size={18} aria-hidden="true" />
              <span>Upload Document</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'url'}
              onClick={() => setActiveTab('url')}
              className={`btn-ghost !min-h-[44px] !px-4 text-sm font-semibold ${
                activeTab === 'url'
                  ? 'bg-brand-100 text-brand-700 border-brand-600'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Globe size={18} aria-hidden="true" />
              <span>Web URL</span>
            </button>
          </div>

          {/* Quick Demo Pre-load Samples for Judges */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted hidden sm:inline">Try Sample:</span>
            {DEMO_SAMPLES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => loadSample(sample)}
                className="btn-ghost !min-h-[38px] !px-2.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                title={`Load sample: ${sample.name}`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Tab 1: Paste Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="font-semibold text-ink text-base">
                  Your content
                </label>
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`btn-ghost !min-h-[44px] !px-3 text-xs font-semibold ${
                      isListening ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse' : ''
                    }`}
                    aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation with microphone'}
                  >
                    {isListening ? (
                      <>
                        <MicOff size={16} aria-hidden="true" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={16} aria-hidden="true" />
                        <span>Dictate with Mic</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <textarea
                id="content"
                rows={8}
                className="input focus:outline-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste legal notice, medical note, or complex article here…"
                required
              />
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === 'file' && (
            <div className="space-y-2">
              <label htmlFor="file-input" className="font-semibold text-ink text-base block">
                Upload PDF or Text document (.pdf, .txt)
              </label>
              <div className="rounded-2xl border-2 border-dashed border-line bg-surface p-8 text-center space-y-3">
                <Upload size={32} className="mx-auto text-muted" aria-hidden="true" />
                <div>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label htmlFor="file-input" className="btn-primary cursor-pointer !min-h-[44px]">
                    Choose Document
                  </label>
                </div>
                <p className="text-xs text-muted">
                  {selectedFile
                    ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                    : 'Supports PDF & TXT files up to 10MB'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Web URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label htmlFor="url-input" className="font-semibold text-ink text-base block">
                Website or Article URL
              </label>
              <input
                id="url-input"
                type="url"
                className="input focus:outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.gov/gazette/welfare-notice"
                required
              />
            </div>
          )}

          {/* Reading Level & Translation Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line">
            <div>
              <label htmlFor="reading-level" className="block text-xs font-bold uppercase text-muted mb-1.5">
                Target Reading Level
              </label>
              <select
                id="reading-level"
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
                className="input !py-2.5 text-sm font-medium"
              >
                {READING_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="target-language" className="block text-xs font-bold uppercase text-muted mb-1.5">
                Translate Into
              </label>
              <select
                id="target-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input !py-2.5 text-sm font-semibold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto text-base !min-h-[48px]"
            disabled={
              loading ||
              (activeTab === 'text' && !text.trim()) ||
              (activeTab === 'file' && !selectedFile) ||
              (activeTab === 'url' && !url.trim())
            }
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
            ) : (
              <Sparkles size={20} aria-hidden="true" />
            )}
            <span>{loading ? 'Simplifying…' : 'Simplify Content'}</span>
          </button>
        </form>
      </section>

      {/* Screen readers announce results and errors automatically */}
      <div aria-live="polite" aria-busy={loading} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
          >
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* AI Results */}
        {data && (
          <div className="space-y-6 pt-2">
            {/* Top Bar for Results */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-brand-700" aria-hidden="true" />
                <span className="font-bold text-brand-700 text-sm">
                  Content Simplified Successfully ({readingLevel} • {language})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAskAssistant}
                className="btn-ghost !min-h-[40px] text-xs font-semibold text-brand-700 hover:bg-brand-100 flex items-center gap-1.5"
                aria-label="Ask questions about this text in Voice Assistant"
              >
                <HelpCircle size={16} aria-hidden="true" />
                <span>Ask Voice Assistant</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>

            {/* 1. Plain Version */}
            {data.plainVersion && (
              <ResultCard title="Plain version" text={data.plainVersion} lang={language} />
            )}

            {/* 2. Key Points */}
            {data.keyPoints?.length > 0 && (
              <ResultCard title="Key points" text={data.keyPoints.join('. ')} lang={language}>
                <ul className="space-y-2 mt-3 list-none pl-0">
                  {data.keyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-line text-ink text-sm leading-relaxed"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-white font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </ResultCard>
            )}

            {/* 3. Action Steps Checklist */}
            {data.nextSteps?.length > 0 && (
              <ResultCard
                title="What should I do next?"
                text={data.nextSteps.join('. ')}
                lang={language}
              >
                <ol className="space-y-2 mt-3 list-none pl-0">
                  {data.nextSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-line text-ink text-sm leading-relaxed"
                    >
                      <ListOrdered size={18} className="text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </ResultCard>
            )}

            {/* 4. Regional Translation */}
            {data.translation?.text && (
              <ResultCard
                title={`Translation (${data.translation.language || language})`}
                text={data.translation.text}
                lang={data.translation.language || language}
              />
            )}

            {/* 5. Difficult Words Glossary */}
            {data.glossary?.length > 0 && (
              <ResultCard title="Difficult words explained (Glossary)" lang={language}>
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  {data.glossary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface border border-line space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <BookMarked size={16} className="text-brand-700" aria-hidden="true" />
                        <h3 className="font-bold text-ink text-sm">{item.term}</h3>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        {item.definition || item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* 6. Warnings / Important Notice */}
            {data.warnings?.length > 0 && (
              <div
                role="note"
                className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
              >
                <AlertTriangle className="flex-shrink-0 mt-0.5 text-amber-700" size={20} aria-hidden="true" />
                <div className="text-sm">
                  <strong>Important: </strong>
                  <span>{data.warnings.join(' ')}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
