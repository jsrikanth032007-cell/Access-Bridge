import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { useSpeech } from '../hooks/useSpeech.js';
import { useTTS } from '../hooks/useTTS.js';
import api from '../services/api.js';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  FileText,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton, MicInputButton } from '../components/SpeechControls.jsx';

export default function VoiceAssistant() {
  const { settings } = useAccessibility();
  const location = useLocation();
  const { speak, stop: stopTTS } = useTTS();

  const [contextText, setContextText] = useState(location.state?.context || '');
  const [showContext, setShowContext] = useState(!!location.state?.context);
  const [questionText, setQuestionText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your AccessBridge Voice Assistant. Click the microphone button below to ask a question, or type your query. I will speak the answer back to you.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech({
    language: settings.preferredLanguage || 'English',
    onResult: (text) => {
      setQuestionText(text);
    },
  });

  // Keep questionText updated while listening
  useEffect(() => {
    if (transcript) {
      setQuestionText(transcript);
    }
  }, [transcript]);

  const handleSend = async (queryToSend) => {
    const query = (queryToSend || questionText).trim();
    if (!query) return;

    if (isListening) {
      stopListening();
    }

    const userMessage = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestionText('');
    resetTranscript();
    setError('');

    try {
      setIsLoading(true);
      const res = await api.post('/ai/ask', {
        question: query,
        context: contextText,
        language: settings.preferredLanguage || 'English',
      });

      if (res.data.success) {
        const answerText = res.data.result.answer;
        const assistantMessage = {
          sender: 'assistant',
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Speak answer back using speech synthesis
        speak(answerText, settings.preferredLanguage || 'English');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to get a response from the voice assistant. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Mic className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Interactive Speech Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Voice Assistant
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Ask questions naturally with your microphone or keyboard. Ask for explanations of difficult
          paragraphs, deadlines, or required actions. Spoken answers are read back to you.
        </p>
      </div>

      {/* Context Drawer (Document background) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
            aria-expanded={showContext}
          >
            <FileText className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>
              {contextText ? 'Document Context Attached' : 'Attach Document Context (Optional)'}
            </span>
          </button>
          {contextText && (
            <button
              onClick={() => setContextText('')}
              className="text-xs text-rose-600 hover:underline"
            >
              Clear Context
            </button>
          )}
        </div>

        {showContext && (
          <div>
            <label htmlFor="context-input" className="sr-only">
              Document Background Context
            </label>
            <textarea
              id="context-input"
              rows="3"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Paste any document snippet, policy, or notes you want to ask questions about..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Speech / API Error Alert */}
      {(error || speechError) && (
        <div
          role="alert"
          aria-live="polite"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
          <span>{error || speechError}</span>
        </div>
      )}

      {/* Conversation History Box */}
      <section
        aria-live="polite"
        aria-label="Conversation Messages"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            } space-y-1`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[85%] text-base leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {msg.sender === 'user' ? 'You' : 'AccessBridge Assistant'}
                </span>
                <span className="text-[11px] opacity-70">{msg.time}</span>
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <TTSButton
                    text={msg.text}
                    language={settings.preferredLanguage || 'English'}
                    label="Replay Speech"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-slate-500">
            <LoadingSpinner message="Assistant is preparing spoken answer..." size="sm" />
          </div>
        )}
      </section>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase">Quick Questions:</span>
        <button
          type="button"
          onClick={() => handleSend('Explain this in very simple words')}
          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          "Explain this simply"
        </button>
        <button
          type="button"
          onClick={() => handleSend('What is the deadline or due date mentioned?')}
          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          "What is the deadline?"
        </button>
        <button
          type="button"
          onClick={() => handleSend('What specific actions must I take?')}
          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          "What actions must I take?"
        </button>
      </div>

      {/* Voice and Text Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2"
      >
        {/* Microphone Button */}
        <MicInputButton
          isListening={isListening}
          onStart={startListening}
          onStop={stopListening}
          isSupported={isSpeechSupported}
        />

        {/* Text Input for query */}
        <label htmlFor="voice-query-input" className="sr-only">
          Ask question by typing or speaking
        </label>
        <input
          id="voice-query-input"
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening to your speech... speak clearly'
              : 'Ask a question or speak with the microphone...'
          }
          className="flex-1 px-4 py-2.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !questionText.trim()}
          className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-40 transition-colors shadow-sm"
          aria-label="Send question to voice assistant"
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </main>
  );
}
