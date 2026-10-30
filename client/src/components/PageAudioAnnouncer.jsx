import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility, PAGE_AUDIO_INTRODUCTIONS } from '../context/AccessibilityContext.jsx';

export default function PageAudioAnnouncer() {
  const location = useLocation();
  const { settings, hasSpokenApproval, speakText } = useAccessibility();
  const prevPathRef = useRef(null);

  useEffect(() => {
    // Only speak page navigation if user has approved audio or autoReadAloud/blindAccessibilityMode is true
    const shouldSpeak =
      (settings.blindAccessibilityMode || settings.autoReadAloud) && hasSpokenApproval;

    if (shouldSpeak && prevPathRef.current !== location.pathname) {
      const activeLang = settings.preferredLanguage || 'English';
      const langIntros = PAGE_AUDIO_INTRODUCTIONS[activeLang] || PAGE_AUDIO_INTRODUCTIONS.English;
      const intro = langIntros ? langIntros[location.pathname] : null;

      if (intro) {
        // Short pause to allow previous speech to settle
        const timer = setTimeout(() => {
          speakText(intro, activeLang);
        }, 300);
        return () => clearTimeout(timer);
      }
    }

    prevPathRef.current = location.pathname;
  }, [
    location.pathname,
    settings.blindAccessibilityMode,
    settings.autoReadAloud,
    hasSpokenApproval,
    settings.preferredLanguage,
    speakText,
  ]);

  return null;
}
