import React, { useState, useEffect } from 'react';
import { Volume2, Square, Copy, Check } from 'lucide-react';

export default function ResultCard({ title, text, children, lang = 'en-IN' }) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stop speaking when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Map common languages
    const langMap = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN',
      Telugu: 'te-IN',
      Malayalam: 'ml-IN',
      Kannada: 'kn-IN',
    };
    utterance.lang = langMap[lang] || lang || 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const headingId = `h-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <section className="card" aria-labelledby={headingId}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-bold text-ink">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {text && (
            <button
              type="button"
              onClick={toggleSpeak}
              className="btn-ghost !min-h-[44px] !px-3.5"
              aria-label={speaking ? `Stop reading ${title}` : `Read ${title} aloud`}
              aria-pressed={speaking}
            >
              {speaking ? (
                <Square size={16} aria-hidden="true" />
              ) : (
                <Volume2 size={16} aria-hidden="true" />
              )}
              <span className="hidden sm:inline text-sm font-semibold">
                {speaking ? 'Stop' : 'Listen'}
              </span>
            </button>
          )}
          {text && (
            <button
              type="button"
              onClick={handleCopy}
              className="btn-ghost !min-h-[44px] !px-3.5"
              aria-label={`Copy ${title}`}
            >
              {copied ? (
                <Check size={16} className="text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}
              <span className="hidden sm:inline text-sm font-semibold">
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
          )}
        </div>
      </div>
      {text && <p className="leading-relaxed text-ink whitespace-pre-line mb-3">{text}</p>}
      {children}
    </section>
  );
}

