import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { Volume2, Sparkles, Check, Languages, Eye, X, Ear } from 'lucide-react';

const LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function AccessibilityApprovalModal() {
  const { showApprovalModal, setShowApprovalModal, approveDeviceAccessibility, settings } =
    useAccessibility();

  const [selectedLang, setSelectedLang] = useState(settings.preferredLanguage || 'English');

  if (!showApprovalModal) return null;

  const handleApprove = () => {
    approveDeviceAccessibility(selectedLang);
  };

  const handleDismiss = () => {
    setShowApprovalModal(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-approval-title"
      aria-describedby="a11y-approval-desc"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border-4 border-brand-500 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
              <Volume2 className="w-6 h-6 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Assistive Device Approval
              </span>
              <h2 id="a11y-approval-title" className="text-2xl font-black">
                Enable Voice & Screen Assistance
              </h2>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close accessibility approval dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p id="a11y-approval-desc" className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Welcome to <strong>AccessBridge</strong>. For blind and visually impaired individuals,
          approving device speech enables spoken page introductions, automatic result read-aloud, and
          hands-free speech assistance.
        </p>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold flex items-center gap-2">
            <Languages className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>Choose Your Preferred Spoken Language:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                type="button"
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center justify-center transition-all ${
                  selectedLang === lang.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400 ring-offset-2 dark:ring-offset-slate-900'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
                aria-pressed={selectedLang === lang.id}
              >
                <span className="text-base">{lang.native}</span>
                <span className="text-xs opacity-80">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Big Action Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            autoFocus
            onClick={handleApprove}
            className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-lg shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-3 border-2 border-brand-400"
          >
            <Volume2 className="w-6 h-6 animate-bounce" aria-hidden="true" />
            <span>Approve & Start Spoken Assistance</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          >
            Continue with Visual Screen-Reader only
          </button>
        </div>
      </div>
    </div>
  );
}
