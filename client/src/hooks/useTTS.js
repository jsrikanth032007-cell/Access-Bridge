import { useState, useEffect, useCallback } from 'react';
import {
  playSpeech,
  stopAudioSpeech,
  pauseAudioSpeech,
  resumeAudioSpeech,
  subscribeAudioState,
} from '../services/audioPlayer.js';

export const LANGUAGE_CODES = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Malayalam: 'ml-IN',
  Kannada: 'kn-IN',
};

export const LANGUAGE_VOICE_NAMES = {
  English: ['en', 'english', 'us', 'uk', 'india'],
  Tamil: ['ta', 'tamil', 'தமிழ்'],
  Hindi: ['hi', 'hindi', 'हिन्दी'],
  Telugu: ['te', 'telugu', 'తెలుగు'],
  Malayalam: ['ml', 'malayalam', 'മലയാളം'],
  Kannada: ['kn', 'kannada', 'ಕನ್ನಡ'],
};

export const useTTS = () => {
  const [playbackState, setPlaybackState] = useState({
    isSpeaking: false,
    isPaused: false,
  });
  const [voices, setVoices] = useState([]);

  // Subscribe to universal audio player state
  useEffect(() => {
    const unsubscribe = subscribeAudioState((newState) => {
      setPlaybackState(newState);
    });

    // Populate browser voices for fallback & inspection
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          const available = window.speechSynthesis.getVoices() || [];
          if (available.length > 0) {
            setVoices(available);
          }
        } catch {
          // ignore
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const speak = useCallback((text, language = 'English') => {
    playSpeech(text, language);
  }, []);

  const stop = useCallback(() => {
    stopAudioSpeech();
  }, []);

  const pause = useCallback(() => {
    pauseAudioSpeech();
  }, []);

  const resume = useCallback(() => {
    resumeAudioSpeech();
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking: playbackState.isSpeaking,
    isPaused: playbackState.isPaused,
    isSupported: true,
    availableVoices: voices,
  };
};

export default useTTS;
