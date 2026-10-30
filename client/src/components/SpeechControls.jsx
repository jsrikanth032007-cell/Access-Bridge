import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, Square } from 'lucide-react';
import { useTTS } from '../hooks/useTTS.js';

export function TTSButton({ text, language = 'English', label = 'Read Aloud' }) {
  const { speak, stop, isSpeaking, isSupported } = useTTS();

  if (!isSupported || !text) return null;

  return (
    <button
      onClick={() => {
        if (isSpeaking) {
          stop();
        } else {
          speak(text, language);
        }
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        isSpeaking
          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:border-brand-400'
      }`}
      aria-label={isSpeaking ? 'Stop reading content aloud' : `Read content aloud: ${label}`}
      aria-pressed={isSpeaking}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          <span>Stop Reading</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function MicInputButton({ isListening, onStart, onStop, isSupported }) {
  if (!isSupported) {
    return (
      <span className="text-xs text-amber-600 dark:text-amber-400" title="Web Speech API not supported in this browser">
        (Speech mic unavailable)
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
        isListening
          ? 'bg-rose-600 text-white shadow-md animate-pulse'
          : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 dark:bg-slate-800 dark:text-brand-300 dark:border-slate-700'
      }`}
      aria-label={isListening ? 'Stop recording voice question' : 'Start speaking with microphone'}
      aria-pressed={isListening}
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4 animate-bounce" aria-hidden="true" />
          <span>Listening... (Click to stop)</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" aria-hidden="true" />
          <span>Speak Query</span>
        </>
      )}
    </button>
  );
}

export default { TTSButton, MicInputButton };

