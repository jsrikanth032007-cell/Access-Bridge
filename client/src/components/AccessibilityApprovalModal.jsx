import React, { useState } from 'react';
import { useA11y } from '../context/AccessibilityContext';
import { Volume2, X, Languages, Accessibility, Check } from 'lucide-react';

const LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function AccessibilityApprovalModal() {
  const { showApprovalModal, setShowApprovalModal, approveDeviceAccessibility, s } =
    useA11y();

  const [selectedLang, setSelectedLang] = useState(s?.preferredLanguage || 'English');

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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="card max-w-xl w-full border-2 border-brand-700 shadow-2xl p-6 sm:p-8 space-y-6 text-ink">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white shadow-soft">
              <Volume2 size={24} aria-hidden="true" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Assistive Device Setup
              </span>
              <h2 id="a11y-approval-title" className="text-2xl font-extrabold text-ink tracking-tight">
                Enable Voice &amp; Screen Assistance
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="btn-ghost !min-h-[40px] !px-2.5 text-muted hover:text-ink"
            aria-label="Close accessibility approval dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p id="a11y-approval-desc" className="text-base text-muted leading-relaxed">
          Welcome to <strong className="text-ink">AccessBridge</strong>. For blind and visually impaired individuals,
          approving device speech enables spoken page introductions, automatic result read-aloud, and
          hands-free voice assistance in your native language.
        </p>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-muted flex items-center gap-1.5">
            <Languages size={15} className="text-brand-700" aria-hidden="true" />
            <span>Choose Your Preferred Spoken Language:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                type="button"
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`btn-ghost !min-h-[48px] !px-3 text-xs flex flex-col items-center justify-center ${
                  selectedLang === lang.id
                    ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold shadow-soft'
                    : 'text-muted hover:text-ink'
                }`}
                aria-pressed={selectedLang === lang.id}
              >
                <span className="text-sm font-semibold">{lang.native}</span>
                <span className="text-[10px] opacity-80">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            autoFocus
            onClick={handleApprove}
            className="btn-primary w-full !min-h-[50px] text-base font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Volume2 size={20} aria-hidden="true" />
            <span>Approve &amp; Start Spoken Assistance ({selectedLang})</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 text-center text-xs font-semibold text-muted hover:text-ink underline focus:outline-none"
          >
            Continue with standard screen-reader only
          </button>
        </div>
      </div>
    </div>
  );
}
