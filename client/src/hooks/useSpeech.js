import { useState, useEffect, useRef, useCallback } from 'react';

export const LANGUAGE_CODES = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Malayalam: 'ml-IN',
  Kannada: 'kn-IN',
};

export const useSpeech = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(options.language || 'English');

  const recognitionRef = useRef(null);

  // Sync language if option prop changes
  useEffect(() => {
    if (options.language) {
      setCurrentLanguage(options.language);
    }
  }, [options.language]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous !== undefined ? options.continuous : true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGE_CODES[currentLanguage] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item[0]) {
          currentTranscript += item[0].transcript;
        }
      }
      setTranscript(currentTranscript);
      if (options.onResult) {
        options.onResult(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else if (event.error === 'no-speech') {
        // no-speech is common when paused; keep subtle
        setError('No speech detected. Please speak closer to your microphone.');
      } else if (event.error === 'network') {
        setError('Network required for speech recognition. Please check your internet connection.');
      } else {
        setError(`Speech recognition notice: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [currentLanguage, options.continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    try {
      recognitionRef.current.lang = LANGUAGE_CODES[currentLanguage] || 'en-US';
      recognitionRef.current.start();
    } catch (err) {
      console.warn('[useSpeech] Start warning:', err.message);
    }
  }, [currentLanguage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const changeLanguage = useCallback((newLang) => {
    setCurrentLanguage(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGE_CODES[newLang] || 'en-US';
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
    currentLanguage,
  };
};

export default useSpeech;
