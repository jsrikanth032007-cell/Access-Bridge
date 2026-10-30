import { useState, useEffect, useRef, useCallback } from 'react';

export const LANGUAGE_CODES = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Malayalam: 'ml-IN',
  Kannada: 'kn-IN',
};

// Language names mapped to common speech recognition and synthesis tags
export const LANGUAGE_VOICE_NAMES = {
  English: ['en', 'english', 'us', 'uk', 'india'],
  Tamil: ['ta', 'tamil', 'தமிழ்'],
  Hindi: ['hi', 'hindi', 'हिन्दी'],
  Telugu: ['te', 'telugu', 'తెలుగు'],
  Malayalam: ['ml', 'malayalam', 'മലയാളം'],
  Kannada: ['kn', 'kannada', 'ಕನ್ನಡ'],
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
        try {
          const availableVoices = window.speechSynthesis.getVoices() || [];
          if (availableVoices.length > 0) {
            setVoices(availableVoices);
          }
        } catch (e) {
          console.warn('[useTTS] Could not get voices:', e);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      // Retry after 500ms as Chrome often populates voices asynchronously
      const timer = setTimeout(updateVoices, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const cleanTextForSpeech = (text) => {
    if (!text) return '';
    return text
      .replace(/[*#_~`>]/g, '') // remove markdown symbols
      .replace(/\[.*?\]/g, '')  // remove bracket tags like [Tamil Translation]
      .replace(/•/g, ', ')      // convert bullets to speech pauses
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findBestVoice = (targetLang, targetLangCode) => {
    if (!voices || voices.length === 0) return null;

    const codeLower = targetLangCode.toLowerCase();
    const prefix = codeLower.split('-')[0];
    const keywords = LANGUAGE_VOICE_NAMES[targetLang] || [prefix];

    // 1. Exact BCP-47 match
    let match = voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === codeLower);
    if (match) return match;

    // 2. Language prefix match (e.g. 'ta', 'hi', 'te')
    match = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
    if (match) return match;

    // 3. Match by name keywords (e.g. "Google हिन्दी", "Microsoft Valluvar - Tamil")
    match = voices.find((v) => {
      const name = (v.name || '').toLowerCase();
      return keywords.some((kw) => name.includes(kw.toLowerCase()));
    });
    if (match) return match;

    // 4. Default to any voice supporting Indian English if non-English Indian language
    if (prefix !== 'en') {
      match = voices.find((v) => (v.lang && v.lang.toLowerCase().includes('en-in')) || (v.name && v.name.toLowerCase().includes('india')));
      if (match) return match;
    }

    return null;
  };

  const speak = useCallback(
    (text, language = 'English') => {
      if (!synthRef.current || !isSupported) return;

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      try {
        // Cancel ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(cleaned);
        const targetLangCode = LANGUAGE_CODES[language] || 'en-US';
        utterance.lang = targetLangCode;
        utterance.rate = 0.95; // Slightly slower for cognitive ease
        utterance.pitch = 1.0;

        const bestVoice = findBestVoice(language, targetLangCode);
        if (bestVoice) {
          utterance.voice = bestVoice;
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
          // 'canceled' or 'interrupted' is normal when a user switches speech
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('[TTS Error]:', e.error);
          }
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
      } catch (err) {
        console.warn('[useTTS] Speak error:', err.message);
        setIsSpeaking(false);
      }
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch {
        // ignore
      }
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      try {
        synthRef.current.pause();
      } catch {
        // ignore
      }
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      try {
        synthRef.current.resume();
      } catch {
        // ignore
      }
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
    availableVoices: voices,
  };
};

export default useTTS;
