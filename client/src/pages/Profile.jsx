import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/AccessibilityContext';
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
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const DISABILITY_OPTIONS = [
  { id: 'visual', label: 'Visual Impairment / Low Vision', desc: 'Screen-reader, high-contrast, image descriptions' },
  { id: 'dyslexia', label: 'Dyslexia / Reading Strain', desc: 'Lexend typography, enhanced letter and word spacing' },
  { id: 'cognitive', label: 'Cognitive & ADHD Support', desc: 'Plain-language summaries, 3 key points, action steps' },
  { id: 'hearing', label: 'Deaf / Hard of Hearing (HoH)', desc: 'Visual transcripts, lecture notes, comprehension quizzes' },
  { id: 'motor', label: 'Motor & Mobility Difficulty', desc: 'Hands-free voice recognition assistant, full keyboard nav' },
  { id: 'language', label: 'Language & Regional Translation', desc: 'Instant regional translation and spoken audio' },
];

const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'];
const READING_LEVELS = ['Simple', 'Very Simple', 'Original'];
const FONT_SIZES = [
  { id: 14, label: 'Small (14px)' },
  { id: 16, label: 'Default (16px)' },
  { id: 18, label: 'Large (18px)' },
  { id: 22, label: 'Extra Large (22px)' },
];

export default function Profile() {
  const { user } = useAuth();
  const { s, update, updateSettings } = useA11y();

  const [formData, setFormData] = useState({
    disabilityTypes: s.disabilityTypes || [],
    preferredLanguage: s.preferredLanguage || 'English',
    readingLevel: s.readingLevel || 'Simple',
    size: s.size || 16,
    dyslexia: !!s.dyslexia,
    contrast: !!s.contrast,
    reduceMotion: !!s.reduceMotion,
    autoReadAloud: !!s.autoReadAloud,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData({
      disabilityTypes: s.disabilityTypes || [],
      preferredLanguage: s.preferredLanguage || 'English',
      readingLevel: s.readingLevel || 'Simple',
      size: s.size || 16,
      dyslexia: !!s.dyslexia,
      contrast: !!s.contrast,
      reduceMotion: !!s.reduceMotion,
      autoReadAloud: !!s.autoReadAloud,
    });
  }, [s]);

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const current = prev.disabilityTypes;
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      update({ disabilityTypes: updated });
      return { ...prev, disabilityTypes: updated };
    });
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    update({ [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (updateSettings) {
        await updateSettings(formData);
      } else {
        update(formData);
      }
      setSuccessMessage('Accessibility profile updated and saved to your account!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Accessibility Profile</h2>
        <p className="mt-1 text-muted text-base leading-relaxed">
          Customize your sensory, cognitive, and linguistic preferences. AccessBridge saves these
          settings and automatically applies them whenever you simplify text, describe images, or
          read study notes.
        </p>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 p-4 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm font-medium"
        >
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center gap-2.5 p-4 rounded-2xl border border-rose-300 bg-rose-50 text-rose-900 text-sm font-medium"
        >
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Card */}
        <section
          aria-labelledby="account-heading"
          className="card space-y-4"
        >
          <h3 id="account-heading" className="text-xl font-bold text-ink flex items-center gap-2">
            <User size={20} className="text-brand-700" aria-hidden="true" />
            <span>Account Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold uppercase text-muted block mb-1">Name</span>
              <div className="p-3 rounded-xl bg-surface border border-line font-semibold text-ink">
                {user?.name || 'Explorer'}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-muted block mb-1">Email</span>
              <div className="p-3 rounded-xl bg-surface border border-line font-semibold text-ink">
                {user?.email || 'user@accessbridge.org'}
              </div>
            </div>
          </div>
        </section>

        {/* Disability & Focus Areas Card */}
        <section
          aria-labelledby="disability-heading"
          className="card space-y-4"
        >
          <h3 id="disability-heading" className="text-xl font-bold text-ink">
            Disability &amp; Accessibility Focus Areas
          </h3>
          <p className="text-xs text-muted">
            Select all areas you want AccessBridge to optimize for automatically:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DISABILITY_OPTIONS.map((opt) => {
              const isChecked = formData.disabilityTypes.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors min-h-[48px] ${
                    isChecked
                      ? 'bg-brand-100 text-brand-700 border-brand-600 font-semibold'
                      : 'bg-card border-line text-ink hover:bg-brand-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(opt.id)}
                    className="mt-1 w-4 h-4 text-brand-700 rounded border-line focus:ring-brand-600"
                  />
                  <div>
                    <span className="font-bold text-sm block text-ink">{opt.label}</span>
                    <span className="text-xs text-muted font-normal block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Content & Language Preferences Card */}
        <section
          aria-labelledby="content-pref-heading"
          className="card space-y-4"
        >
          <h3 id="content-pref-heading" className="text-xl font-bold text-ink flex items-center gap-2">
            <Languages size={20} className="text-brand-700" aria-hidden="true" />
            <span>Content &amp; Language Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-language"
                className="block text-xs font-bold uppercase text-muted mb-1.5"
              >
                Preferred Language
              </label>
              <select
                id="profile-language"
                value={formData.preferredLanguage}
                onChange={(e) => handleFieldChange('preferredLanguage', e.target.value)}
                className="input !py-2.5 text-sm font-semibold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">
                Simplifications and spoken answers default to this language.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-reading-level"
                className="block text-xs font-bold uppercase text-muted mb-1.5"
              >
                Default Reading Level
              </label>
              <select
                id="profile-reading-level"
                value={formData.readingLevel}
                onChange={(e) => handleFieldChange('readingLevel', e.target.value)}
                className="input !py-2.5 text-sm font-semibold"
              >
                {READING_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Level
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">
                Controls sentence complexity and vocabulary choices.
              </p>
            </div>
          </div>
        </section>

        {/* Visual & Sensory Adaptations Card */}
        <section
          aria-labelledby="sensory-heading"
          className="card space-y-6"
        >
          <h3 id="sensory-heading" className="text-xl font-bold text-ink flex items-center gap-2">
            <Eye size={20} className="text-brand-700" aria-hidden="true" />
            <span>Visual &amp; Sensory Adaptations</span>
          </h3>

          {/* Text Scaling Size */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-muted">
              Text Scaling Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_SIZES.map((fs) => (
                <button
                  type="button"
                  key={fs.id}
                  onClick={() => handleFieldChange('size', fs.id)}
                  className={`btn-ghost !min-h-[44px] !px-3 text-xs font-semibold ${
                    formData.size === fs.id
                      ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={formData.size === fs.id}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-3 pt-3 border-t border-line">
            {/* Dyslexia Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-line">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Type size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className="font-bold text-sm text-ink block">
                    Dyslexia-Friendly Typography (Lexend)
                  </span>
                  <span className="text-xs text-muted">
                    Wider letter spacing, higher line height, and character distinctions.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.dyslexia}
                onChange={(e) => handleFieldChange('dyslexia', e.target.checked)}
                className="w-5 h-5 text-brand-700 rounded border-line focus:ring-brand-600"
              />
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-line">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <SunMoon size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className="font-bold text-sm text-ink block">
                    High-Contrast Color Theme
                  </span>
                  <span className="text-xs text-muted">
                    Deep black background, yellow accents, and white text with 1px borders.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.contrast}
                onChange={(e) => handleFieldChange('contrast', e.target.checked)}
                className="w-5 h-5 text-brand-700 rounded border-line focus:ring-brand-600"
              />
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-line">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Wind size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className="font-bold text-sm text-ink block">
                    Reduced Motion
                  </span>
                  <span className="text-xs text-muted">
                    Disables interface animations and transitions to prevent motion sensitivity.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.reduceMotion}
                onChange={(e) => handleFieldChange('reduceMotion', e.target.checked)}
                className="w-5 h-5 text-brand-700 rounded border-line focus:ring-brand-600"
              />
            </div>

            {/* Auto Read-Aloud Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-line">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Volume2 size={18} aria-hidden="true" />
                </span>
                <div>
                  <span className="font-bold text-sm text-ink block">
                    Automatic Read-Aloud
                  </span>
                  <span className="text-xs text-muted">
                    Immediately reads out simplifications and descriptions via text-to-speech.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoReadAloud}
                onChange={(e) => handleFieldChange('autoReadAloud', e.target.checked)}
                className="w-5 h-5 text-brand-700 rounded border-line focus:ring-brand-600"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary !min-h-[48px] text-base px-8"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
            ) : (
              <Save size={20} aria-hidden="true" />
            )}
            <span>{isSaving ? 'Saving…' : 'Save Accessibility Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
