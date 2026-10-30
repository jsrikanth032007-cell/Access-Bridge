import React from 'react';
import { useAccessibility, ACCESSIBLE_GREETINGS } from '../context/AccessibilityContext.jsx';
import {
  Type,
  SunMoon,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  Settings2,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';

const LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const READING_LEVELS = ['Simple', 'Very Simple', 'Original'];

export default function AccessibilityToolbar() {
  const {
    settings,
    updateSettings,
    toggleDyslexiaFont,
    toggleHighContrast,
    setPreferredLanguage,
    setShowApprovalModal,
    speakText,
  } = useAccessibility();

  const handleFontSizeChange = (size) => {
    updateSettings({ fontSize: size });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setPreferredLanguage(newLang);
  };

  const handleReadingLevelChange = (e) => {
    updateSettings({ readingLevel: e.target.value });
  };

  const handleTestSpeech = () => {
    const lang = settings.preferredLanguage || 'English';
    const greeting = ACCESSIBLE_GREETINGS[lang] || ACCESSIBLE_GREETINGS.English;
    speakText(greeting, lang);
  };

  const handleReset = () => {
    updateSettings({
      fontSize: 'medium',
      dyslexiaFont: false,
      highContrast: false,
      reducedMotion: false,
      autoReadAloud: false,
      blindAccessibilityMode: false,
      preferredLanguage: 'English',
      readingLevel: 'Simple',
    });
  };

  return (
    <aside
      aria-label="Accessibility Customization Toolbar"
      className="bg-slate-900 text-slate-100 border-b border-slate-700 py-2 px-4 shadow-sm sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Quick Toolbar items */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-400 mr-1 flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-brand-400" aria-hidden="true" />
            <span>Accessibility:</span>
          </span>

          {/* Blind Mode & Voice Device Approval trigger */}
          <button
            onClick={() => setShowApprovalModal(true)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              settings.blindAccessibilityMode || settings.autoReadAloud
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 ring-offset-1 ring-offset-slate-900'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-label="Open Device Accessibility Approval for Blind users and Voice Guidance"
          >
            <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Voice & Blind Assist: {settings.autoReadAloud ? 'ACTIVE' : 'SETUP'}</span>
          </button>

          {/* Speak / Test voice greeting */}
          <button
            onClick={handleTestSpeech}
            className="p-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-brand-300 font-semibold border border-slate-700 flex items-center gap-1"
            title="Listen to Spoken Welcome in your language"
            aria-label="Listen to Spoken Welcome in your preferred language"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            <span>Voice Test</span>
          </button>

          {/* Font Size Selector */}
          <div
            className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700"
            role="group"
            aria-label="Text Size Controls"
          >
            <button
              onClick={() => handleFontSizeChange('small')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                settings.fontSize === 'small' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Set text size to Small"
              aria-pressed={settings.fontSize === 'small'}
            >
              A-
            </button>
            <button
              onClick={() => handleFontSizeChange('medium')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                settings.fontSize === 'medium' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Set text size to Medium"
              aria-pressed={settings.fontSize === 'medium'}
            >
              A
            </button>
            <button
              onClick={() => handleFontSizeChange('large')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                settings.fontSize === 'large' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Set text size to Large"
              aria-pressed={settings.fontSize === 'large'}
            >
              A+
            </button>
            <button
              onClick={() => handleFontSizeChange('xlarge')}
              className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                settings.fontSize === 'xlarge' ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Set text size to Extra Large"
              aria-pressed={settings.fontSize === 'xlarge'}
            >
              A++
            </button>
          </div>

          {/* Dyslexia Font Toggle */}
          <button
            onClick={toggleDyslexiaFont}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              settings.dyslexiaFont
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-label="Toggle Dyslexia-friendly font"
            aria-pressed={settings.dyslexiaFont}
          >
            <Type className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dyslexia Font: {settings.dyslexiaFont ? 'ON' : 'OFF'}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              settings.highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            aria-label="Toggle High-Contrast color theme"
            aria-pressed={settings.highContrast}
          >
            <SunMoon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Contrast: {settings.highContrast ? 'HIGH' : 'NORMAL'}</span>
          </button>
        </div>

        {/* Language & Reading Level Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preferred Language with All Required Options */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <Languages className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            <label htmlFor="toolbar-language" className="sr-only">
              Select Language
            </label>
            <select
              id="toolbar-language"
              value={settings.preferredLanguage}
              onChange={handleLanguageChange}
              className="bg-transparent text-xs text-slate-200 focus:outline-none focus:text-white cursor-pointer font-semibold"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Reading Level */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            <label htmlFor="toolbar-reading-level" className="sr-only">
              Select Reading Level
            </label>
            <select
              id="toolbar-reading-level"
              value={settings.readingLevel}
              onChange={handleReadingLevelChange}
              className="bg-transparent text-xs text-slate-200 focus:outline-none focus:text-white cursor-pointer"
            >
              {READING_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-slate-900 text-white">
                  {lvl} Level
                </option>
              ))}
            </select>
          </div>

          {/* Reset Settings */}
          <button
            onClick={handleReset}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Accessibility Settings"
            aria-label="Reset all accessibility settings to default"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
