/**
 * Universal High-Fidelity Audio Player for AccessBridge
 * Supports native spoken audio in all 6 supported languages:
 * English, Tamil, Hindi, Telugu, Malayalam, Kannada
 */

let currentAudio = null;
let currentUtterance = null;
const listeners = new Set();

let state = {
  isSpeaking: false,
  isPaused: false,
};

function notify() {
  const current = { ...state };
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.warn('[audioPlayer listener error]:', e);
    }
  });
}

export function subscribeAudioState(fn) {
  listeners.add(fn);
  fn({ ...state });
  return () => {
    listeners.delete(fn);
  };
}

export function stopAudioSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    currentUtterance = null;
  }

  state.isSpeaking = false;
  state.isPaused = false;
  notify();
}

export function pauseAudioSpeech() {
  if (currentAudio && !currentAudio.paused) {
    try {
      currentAudio.pause();
      state.isPaused = true;
      notify();
    } catch (e) {
      // ignore
    }
    return;
  }

  if (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    window.speechSynthesis.speaking &&
    !window.speechSynthesis.paused
  ) {
    try {
      window.speechSynthesis.pause();
      state.isPaused = true;
      notify();
    } catch (e) {
      // ignore
    }
  }
}

export function resumeAudioSpeech() {
  if (currentAudio && currentAudio.paused) {
    try {
      currentAudio.play();
      state.isPaused = false;
      notify();
    } catch (e) {
      // ignore
    }
    return;
  }

  if (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    window.speechSynthesis.paused
  ) {
    try {
      window.speechSynthesis.resume();
      state.isPaused = false;
      notify();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Play spoken text in any of the 6 languages
 */
export async function playSpeech(text, language = 'English') {
  // Always stop previous speech before starting new speech
  stopAudioSpeech();

  const cleaned = (text || '')
    .replace(/[*#_~`>]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/•/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return;

  // Endpoint streamed from backend
  const url = `/api/ai/tts?lang=${encodeURIComponent(language)}&text=${encodeURIComponent(cleaned)}`;

  try {
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onplay = () => {
      state.isSpeaking = true;
      state.isPaused = false;
      notify();
    };

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        state.isSpeaking = false;
        state.isPaused = false;
        notify();
      }
    };

    audio.onerror = (e) => {
      console.warn('[audioPlayer] Server audio error, trying browser speech synthesis fallback:', e);
      if (currentAudio === audio) {
        currentAudio = null;
      }
      playBrowserFallback(cleaned, language);
    };

    audio.onpause = () => {
      if (!audio.ended) {
        state.isPaused = true;
        notify();
      }
    };

    await audio.play();
  } catch (err) {
    console.warn('[audioPlayer] HTML5 Audio play error:', err.message);
    playBrowserFallback(cleaned, language);
  }
}

function playBrowserFallback(cleaned, language) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    state.isSpeaking = false;
    notify();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const codes = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN',
      Telugu: 'te-IN',
      Malayalam: 'ml-IN',
      Kannada: 'kn-IN',
    };
    utterance.lang = codes[language] || 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices() || [];
    const prefix = (codes[language] || 'en').split('-')[0].toLowerCase();
    const voiceMatch = voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(prefix)
    );
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onstart = () => {
      state.isSpeaking = true;
      state.isPaused = false;
      notify();
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      state.isPaused = false;
      currentUtterance = null;
      notify();
    };

    utterance.onerror = () => {
      state.isSpeaking = false;
      state.isPaused = false;
      currentUtterance = null;
      notify();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('[audioPlayer] Browser fallback failed:', e);
    state.isSpeaking = false;
    notify();
  }
}

export default {
  playSpeech,
  stopAudioSpeech,
  pauseAudioSpeech,
  resumeAudioSpeech,
  subscribeAudioState,
};

