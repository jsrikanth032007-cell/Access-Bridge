import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import api from '../services/api.js';
import {
  User,
  Settings,
  Check,
  Sparkles,
  AlertCircle,
  Eye,
  Type,
  SunMoon,
  Volume2,
  Wind,
  Save,
  Languages,
  BookOpen,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const DISABILITY_OPTIONS = [
  { id: 'visual', label: 'Visual Impairment / Low Vision', desc: 'Screen-reader, high-contrast, image descriptions' },
  { id: 'dyslexia', label: 'Dyslexia / Reading Difficulties', desc: 'Lexend typography, enhanced letter spacing' },
  { id: 'cognitive', label: 'Cognitive & ADHD Support', desc: 'Plain-language summaries, 3 key points, action steps' },
  { id: 'hearing', label: 'Deaf / Hard of Hearing (HoH)', desc: 'Visual transcripts, lecture notes, comprehension quizzes' },
  { id: 'motor', label: 'Motor & Mobility Difficulty', desc: 'Hands-free voice recognition assistant, full keyboard nav' },
  { id: 'language', label: 'Language & Translation Barriers', desc: 'Instant regional translation and spoken audio' },
];

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'];
const READING_LEVELS = ['Simple', 'Very Simple', 'Original'];
const FONT_SIZES = [
  { id: 'small', label: 'Small (0.9x)' },
  { id: 'medium', label: 'Medium (Default)' },
  { id: 'large', label: 'Large (1.2x)' },
  { id: 'xlarge', label: 'Extra Large (1.45x)' },
];

export default function Profile() {
  const { user, profile } = useAuth();
  const { settings, updateSettings } = useAccessibility();

  // Local state for form
  const [formData, setFormData] = useState({
    disabilityTypes: settings.disabilityTypes || [],
    preferredLanguage: settings.preferredLanguage || 'English',
    readingLevel: settings.readingLevel || 'Simple',
    fontSize: settings.fontSize || 'medium',
    dyslexiaFont: !!settings.dyslexiaFont,
    highContrast: !!settings.highContrast,
    reducedMotion: !!settings.reducedMotion,
    autoReadAloud: !!settings.autoReadAloud,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync initial profile
  useEffect(() => {
    if (settings) {
      setFormData({
        disabilityTypes: settings.disabilityTypes || [],
        preferredLanguage: settings.preferredLanguage || 'English',
        readingLevel: settings.readingLevel || 'Simple',
        fontSize: settings.fontSize || 'medium',
        dyslexiaFont: !!settings.dyslexiaFont,
        highContrast: !!settings.highContrast,
        reducedMotion: !!settings.reducedMotion,
        autoReadAloud: !!settings.autoReadAloud,
      });
    }
  }, [settings]);

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const current = prev.disabilityTypes;
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, disabilityTypes: updated };
    });
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Instantly apply visual preview to app
    updateSettings({ [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateSettings(formData);
      setSuccessMessage('Accessibility profile updated and saved to your account!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Personalization Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Accessibility Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Customize your sensory, cognitive, and linguistic preferences. AccessBridge saves these
          settings and automatically applies them whenever you simplify text, describe images, or
          read study notes.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2.5"
        >
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account Details */}
        <section
          aria-labelledby="account-details-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <h2
            id="account-details-heading"
            className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <User className="w-5 h-5 text-brand-600" aria-hidden="true" />
            <span>Account Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Name</span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {user?.name || 'Explorer'}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Email</span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
        </section>

        {/* Disability Types Selection */}
        <section
          aria-labelledby="disability-types-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4"
        >
          <h2
            id="disability-types-heading"
            className="text-xl font-bold text-slate-900 dark:text-white"
          >
            Disability & Accessibility Focus Areas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select all areas you want AccessBridge to optimize for:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DISABILITY_OPTIONS.map((opt) => {
              const isChecked = formData.disabilityTypes.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-500 dark:border-brand-600'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(opt.id)}
                    className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Content & Language Preferences */}
        <section
          aria-labelledby="content-pref-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
        >
          <h2
            id="content-pref-heading"
            className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Languages className="w-5 h-5 text-brand-600" aria-hidden="true" />
            <span>Content & Language Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Preferred Language */}
            <div>
              <label
                htmlFor="profile-language"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
              >
                Preferred Language
              </label>
              <select
                id="profile-language"
                value={formData.preferredLanguage}
                onChange={(e) => handleFieldChange('preferredLanguage', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Simplifications and spoken answers will default to this language.
              </p>
            </div>

            {/* Reading Level */}
            <div>
              <label
                htmlFor="profile-reading-level"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
              >
                Default Reading Level
              </label>
              <select
                id="profile-reading-level"
                value={formData.readingLevel}
                onChange={(e) => handleFieldChange('readingLevel', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base"
              >
                {READING_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Reading Level
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Controls sentence complexity and vocabulary choices.
              </p>
            </div>
          </div>
        </section>

        {/* Visual & Sensory Preferences */}
        <section
          aria-labelledby="sensory-pref-heading"
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
        >
          <h2
            id="sensory-pref-heading"
            className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"
          >
            <Eye className="w-5 h-5 text-brand-600" aria-hidden="true" />
            <span>Visual & Sensory Adaptations</span>
          </h2>

          {/* Font Size Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Text Scaling Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_SIZES.map((fs) => (
                <button
                  type="button"
                  key={fs.id}
                  onClick={() => handleFieldChange('fontSize', fs.id)}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                    formData.fontSize === fs.id
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                  aria-pressed={formData.fontSize === fs.id}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Dyslexia-Friendly Font Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700">
                  <Type className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Dyslexia-Friendly Typography (Lexend)
                  </span>
                  <span className="text-xs text-slate-500">
                    Wider letter spacing, higher line height, and character distinctions.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dyslexiaFont}
                onChange={(e) => handleFieldChange('dyslexiaFont', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </div>

            {/* High Contrast Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700">
                  <SunMoon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    High-Contrast Color Theme
                  </span>
                  <span className="text-xs text-slate-500">
                    Deep black backgrounds, high contrast borders, and vivid yellow focus outlines.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.highContrast}
                onChange={(e) => handleFieldChange('highContrast', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700">
                  <Wind className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Reduced Motion
                  </span>
                  <span className="text-xs text-slate-500">
                    Disables interface transitions and animations to prevent vestibular dizziness.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.reducedMotion}
                onChange={(e) => handleFieldChange('reducedMotion', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </div>

            {/* Auto Read-Aloud Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700">
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    Automatic Read-Aloud
                  </span>
                  <span className="text-xs text-slate-500">
                    Immediately reads out simplifications and image descriptions via text-to-speech.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoReadAloud}
                onChange={(e) => handleFieldChange('autoReadAloud', e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <LoadingSpinner message="Saving profile..." size="sm" />
            ) : (
              <>
                <Save className="w-5 h-5" aria-hidden="true" />
                <span>Save Accessibility Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

