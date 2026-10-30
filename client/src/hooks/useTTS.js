import { useState, useEffect, useRef, useCallback } from 'react';

const LANGUAGE_CODES = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Malayalam: 'ml-IN',
  Kannada: 'kn-IN',
};

export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voices, setVoices] = useState([]);

  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/[*#_~`>]/g, '') // remove markdown symbols
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speak = useCallback(
    (text, language = 'English') => {
      if (!synthRef.current || !isSupported) return;

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const targetLangCode = LANGUAGE_CODES[language] || 'en-US';
      utterance.lang = targetLangCode;
      utterance.rate = 0.95; // slightly slower for maximum comprehension & cognitive ease
      utterance.pitch = 1.0;

      // Attempt to pick a matching voice if present
      if (voices.length > 0) {
        const matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === targetLangCode.toLowerCase() ||
            v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0].toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        console.warn('[TTS Error]:', e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      synthRef.current.speak(utterance);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  };
};

export default useTTS;
