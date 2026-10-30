import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api.js';

const AccessibilityContext = createContext(null);

const DEFAULT_SETTINGS = {
  disabilityTypes: [],
  preferredLanguage: 'English',
  readingLevel: 'Simple',
  fontSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  autoReadAloud: false,
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

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('accessbridge_a11y');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // When authenticated profile loads, sync it into settings
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

    // Apply Dyslexia-friendly font class
    if (settings.dyslexiaFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    // Apply High-contrast theme class
    if (settings.highContrast) {
      body.classList.add('high-contrast');
      root.classList.add('dark');
    } else {
      body.classList.remove('high-contrast');
      root.classList.remove('dark');
    }

    // Apply Reduced-motion class
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
  }, [settings]);

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
  const setPreferredLanguage = (lang) => updateSettings({ preferredLanguage: lang });
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
