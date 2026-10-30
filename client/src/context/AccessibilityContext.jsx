import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';
import { LANGUAGE_CODES, LANGUAGE_VOICE_NAMES } from '../hooks/useTTS.js';

const AccessibilityContext = createContext(null);

export const ACCESSIBLE_GREETINGS = {
  English:
    'Welcome to AccessBridge Accessibility Assistant. Spoken voice assistance and auto-read aloud are now active. Press Tab to browse tools or click the microphone to talk.',
  Tamil:
    'AccessBridge அணுகல் உதவி தளத்திற்கு வரவேற்கிறோம். குரல் உதவி மற்றும் தானியங்கி வாசிப்பு வசதி இயக்கப்பட்டுள்ளது. வழிசெலுத்த Tab அழுத்தவும் அல்லது பேச மைக்ரோஃபோனை அழுத்தவும்.',
  Hindi:
    'AccessBridge एक्सेसिबिलिटी असिस्टेंट में आपका स्वागत है। वॉयस असिस्टेंट और ऑटो-रीड सक्रिय हैं। टूल्स पर जाने के लिए Tab दबाएं या बोलने के लिए माइक पर क्लिक करें।',
  Telugu:
    'AccessBridge యాక్సెసిబిలిటీ అసిస్టెంట్‌కి స్వాగతం. వాయిస్ అసిస్టెంట్ మరియు ఆటో-రీడ్ ఆన్ చేయబడ్డాయి. నావిగేట్ చేయడానికి Tab నొక్కండి లేదా మాట్లాడటానికి మైక్రోఫోన్‌ను క్లిక్ చేయండి.',
  Malayalam:
    'AccessBridge ആക്സസിബിലിറ്റി അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. വോയ്സ് അസിസ്റ്റന്റും ഓട്ടോ-റീഡും പ്രവർത്തനക്ഷമമാണ്. നാവിഗേറ്റ് ചെയ്യാൻ Tab അമർത്തുക അല്ലെങ്കിൽ സംസാരിക്കാൻ മൈക്രോഫോൺ ക്ലിക്ക് ചെയ്യുക.',
  Kannada:
    'AccessBridge ಪ್ರವೇಶಿಸುವಿಕೆ ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ. ಧ್ವನಿ ಸಹಾಯಕ ಮತ್ತು ಸ್ವಯಂ-ಓದುವಿಕೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ಪರಿಕರಗಳಿಗಾಗಿ Tab ಒತ್ತಿರಿ ಅಥವಾ ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
};

export const PAGE_AUDIO_INTRODUCTIONS = {
  '/': 'Home page. AccessBridge converts complex documents, medical notices, and images into plain language and speech.',
  '/dashboard': 'Dashboard. Choose Content Simplifier, Image Describer, Voice Assistant, or Lecture Notes.',
  '/simplify': 'Content Simplifier. Paste text, enter URL, or upload PDF to generate plain language, 3 key points, and translations.',
  '/describe-image': 'Image Describer. Upload any diagram or photo to hear detailed scene descriptions, screen-reader alt text, and visible OCR text.',
  '/voice-assistant': 'Voice Assistant. Speak your questions hands-free or choose your language to talk with the assistant.',
  '/lecture-notes': 'Lecture Notes. Convert recorded transcripts into structured summaries and a 3-question learning quiz.',
  '/history': 'Saved History. Review and listen to your past simplifications and image descriptions.',
  '/profile': 'Accessibility Profile. Configure reading level, language, text scaling, and sensory settings.',
};

const DEFAULT_SETTINGS = {
  disabilityTypes: [],
  preferredLanguage: 'English',
  readingLevel: 'Simple',
  fontSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  autoReadAloud: false,
  blindAccessibilityMode: false,
};

const FONT_SCALES = {
  small: '0.9rem',
  medium: '1.05rem',
  large: '1.25rem',
  xlarge: '1.45rem',
};

const LINE_HEIGHT_SCALES = {
  small: '1.5',
  medium: '1.65',
  large: '1.8',
  xlarge: '2.0',
};

export const AccessibilityProvider = ({ children }) => {
  const { profile, isAuthenticated, updateProfileLocally } = useAuth();

  const [hasSpokenApproval, setHasSpokenApproval] = useState(() => {
    return localStorage.getItem('accessbridge_audio_approved') === 'true';
  });

  const [showApprovalModal, setShowApprovalModal] = useState(() => {
    return localStorage.getItem('accessbridge_audio_approved') !== 'true';
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('accessbridge_a11y');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sync profile when user logs in
  useEffect(() => {
    if (profile) {
      setSettings((prev) => {
        const merged = { ...prev, ...profile };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(merged));
        return merged;
      });
    }
  }, [profile]);

  // Apply DOM modifications dynamically whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply font size scale
    const scale = FONT_SCALES[settings.fontSize] || FONT_SCALES.medium;
    const lineHeight = LINE_HEIGHT_SCALES[settings.fontSize] || LINE_HEIGHT_SCALES.medium;
    root.style.setProperty('--text-scale', scale);
    root.style.setProperty('--line-height-scale', lineHeight);

    // Dyslexia-friendly font class
    if (settings.dyslexiaFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // High-contrast theme class
    if (settings.highContrast) {
      body.classList.add('high-contrast');
      root.classList.add('dark');
    } else {
      body.classList.remove('high-contrast');
      root.classList.remove('dark');
    }

    // Reduced-motion class
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }, [settings]);

  // General Speak Helper
  const speakText = useCallback((text, langName = 'English') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetCode = LANGUAGE_CODES[langName] || 'en-US';
      utterance.lang = targetCode;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length > 0) {
        const prefix = targetCode.toLowerCase().split('-')[0];
        const keywords = LANGUAGE_VOICE_NAMES[langName] || [prefix];
        const match =
          voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === targetCode.toLowerCase()) ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix)) ||
          voices.find((v) => keywords.some((kw) => (v.name || '').toLowerCase().includes(kw.toLowerCase())));

        if (match) {
          utterance.voice = match;
        }
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[speakText error]:', e);
    }
  }, []);

  // Approves speech for blind person / user device
  const approveDeviceAccessibility = useCallback(
    (langOverride) => {
      const targetLang = langOverride || settings.preferredLanguage || 'English';
      localStorage.setItem('accessbridge_audio_approved', 'true');
      setHasSpokenApproval(true);
      setShowApprovalModal(false);

      // Enable auto read-aloud and blind accessibility mode
      setSettings((prev) => {
        const updated = {
          ...prev,
          autoReadAloud: true,
          blindAccessibilityMode: true,
          preferredLanguage: targetLang,
        };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(updated));
        return updated;
      });

      // Play immediate spoken greeting in the chosen language
      const greeting = ACCESSIBLE_GREETINGS[targetLang] || ACCESSIBLE_GREETINGS.English;
      setTimeout(() => {
        speakText(greeting, targetLang);
      }, 100);
    },
    [settings.preferredLanguage, speakText]
  );

  // Update preferences and sync with backend if logged in
  const updateSettings = useCallback(
    async (partialSettings) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partialSettings };
        localStorage.setItem('accessbridge_a11y', JSON.stringify(updated));
        return updated;
      });

      if (isAuthenticated) {
        try {
          const res = await api.put('/profile', partialSettings);
          if (res.data.success && res.data.profile) {
            updateProfileLocally(res.data.profile);
          }
        } catch (error) {
          console.warn('Could not sync accessibility settings with server:', error.message);
        }
      }
    },
    [isAuthenticated, updateProfileLocally]
  );

  // Quick toggle helpers
  const toggleDyslexiaFont = () => updateSettings({ dyslexiaFont: !settings.dyslexiaFont });
  const toggleHighContrast = () => updateSettings({ highContrast: !settings.highContrast });
  const cycleFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const nextIdx = (sizes.indexOf(settings.fontSize) + 1) % sizes.length;
    updateSettings({ fontSize: sizes[nextIdx] });
  };
  const setPreferredLanguage = (lang) => {
    updateSettings({ preferredLanguage: lang });
    // Announce language change aloud
    speakText(`Language changed to ${lang}`, lang);
  };
  const setReadingLevel = (level) => updateSettings({ readingLevel: level });

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        toggleDyslexiaFont,
        toggleHighContrast,
        cycleFontSize,
        setPreferredLanguage,
        setReadingLevel,
        hasSpokenApproval,
        showApprovalModal,
        setShowApprovalModal,
        approveDeviceAccessibility,
        speakText,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
