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
  Languages,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton, MicInputButton } from '../components/SpeechControls.jsx';

const ALL_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const LOCALIZED_GREETINGS = {
  English: 'Hello! I am your AccessBridge Voice Assistant. Click the microphone button below to ask a question, and I will speak the answer back to you.',
  Tamil: 'வணக்கம்! நான் உங்கள் AccessBridge குரல் உதவியாளர். பேச மைக்ரோஃபோன் பொத்தானை அழுத்தவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும். தமிழில் பதிலளிப்பேன்.',
  Hindi: 'नमस्ते! मैं आपका AccessBridge वॉयस असिस्टेंट हूँ। बोलने के लिए माइक बटन पर क्लिक करें या अपना प्रश्न लिखें। मैं हिंदी में बोलकर उत्तर दूंगा।',
  Telugu: 'నమస్కారం! నేను మీ AccessBridge వాయిస్ అసిస్టెంట్‌ని. మాట్లాడటానికి మైక్రోఫోన్ బటన్‌ను క్లిಕ್ చేయండి. నేను తెలుగులో సమాధానం చెబుతాను.',
  Malayalam: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AccessBridge വോയ്‌സ് അസിസ്റ്റന്റാണ്. സംസാരിക്കാൻ മൈക്രോഫോൺ ബട്ടൺ ക്ലിക്കുചെയ്യുക. ഞാൻ മലയാളത്തിൽ സംസാരിക്കും.',
  Kannada: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AccessBridge ಧ್ವನಿ ಸಹಾಯಕ. ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ನಾನು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ.',
};

const LOCALIZED_QUICK_QUESTIONS = {
  English: [
    { label: '"Explain this simply"', query: 'Explain this in very simple everyday words.' },
    { label: '"What is the deadline?"', query: 'What is the deadline or due date mentioned?' },
    { label: '"What actions must I take?"', query: 'What specific action steps do I need to take next?' },
  ],
  Tamil: [
    { label: '"எளிமையாக விளக்குங்கள்"', query: 'இதை மிக எளிய அன்றாட சொற்களில் எனக்கு புரியும் வண்ணம் விளக்குங்கள்.' },
    { label: '"கடைசி தேதி என்ன?"', query: 'இதில் குறிப்பிடப்பட்டுள்ள கடைசி தேதி அல்லது காலக்கெடு என்ன?' },
    { label: '"நான் என்ன செய்ய வேண்டும்?"', query: 'நான் உடனடியாக செய்ய வேண்டிய முக்கியமான நடவடிக்கைகள் என்னென்ன?' },
  ],
  Hindi: [
    { label: '"सरल शब्दों में समझाइए"', query: 'कृपया इसे बहुत ही सरल और आसान शब्दों में समझाइए।' },
    { label: '"अंतिम तिथि क्या है?"', query: 'इसमें उल्लिखित अंतिम तिथि या समय सीमा क्या है?' },
    { label: '"मुझे क्या कदम उठाने चाहिए?"', query: 'मुझे आगे कौन से आवश्यक कदम या कार्रवाइयाँ करनी होंगी?' },
  ],
  Telugu: [
    { label: '"సులభంగా వివరించండి"', query: 'దయచేసి దీనిని చాలా సులభమైన రోజువారీ పదాలలో వివరించండి.' },
    { label: '"చివరి తేదీ ఏమిటి?"', query: 'ఇందులో పేర్కొన్న గడువు లేదా చివరి తేదీ ఏమిటి?' },
    { label: '"నేను ఏ చర్యలు తీసుకోవాలి?"', query: 'నేను తదుపరి చేయవలసిన నిర్దిష్ట చర్యలు ఏమిటి?' },
  ],
  Malayalam: [
    { label: '"ലളിതമായി വിശദീകരിക്കുക"', query: 'ദയവായി ഇത് വളരെ ലളിതമായ വാക്കുകളിൽ എനിക്ക് മനസ്സിലാകുന്ന രീതിയിൽ വിശദീകരിക്കുക.' },
    { label: '"അവസാന തീയതി എപ്പോഴാണ്?"', query: 'ഇതിൽ പറഞ്ഞിരിക്കുന്ന അവസാന തീയതി അല്ലെങ്കിൽ സമയപരിധി എപ്പോഴാണ്?' },
    { label: '"ഞാൻ എന്തൊക്കെ ചെയ്യണം?"', query: 'ഞാൻ അടുത്തതായി ചെയ്യേണ്ട പ്രധാനപ്പെട്ട കാര്യങ്ങൾ എന്തൊക്കെയാണ്?' },
  ],
  Kannada: [
    { label: '"ಸರಳವಾಗಿ ವಿವರಿಸಿ"', query: 'ದಯವಿಟ್ಟು ಇದನ್ನು ಅತ್ಯಂತ ಸರಳ ಮತ್ತು ಸುಲಭವಾದ ಪದಗಳಲ್ಲಿ ವಿವರಿಸಿ.' },
    { label: '"ಅಂತಿಮ ದಿನಾಂಕ ಯಾವುದು?"', query: 'ಇದರಲ್ಲಿ ಉಲ್ಲೇಖಿಸಲಾದ ಕೊನೆಯ ದಿನಾಂಕ ಅಥವಾ ಗಡುವು ಯಾವುದು?' },
    { label: '"ನಾನು ಯಾವ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?"', query: 'ನಾನು ಮುಂದೆ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ನಿರ್ದಿಷ್ಟ ಕ್ರಮಗಳು ಯಾವುವು?' },
  ],
};

export default function VoiceAssistant() {
  const { settings, updateSettings, hasSpokenApproval } = useAccessibility();
  const location = useLocation();
  const { speak, stop: stopTTS } = useTTS();

  const [activeLang, setActiveLang] = useState(settings.preferredLanguage || 'English');
  const [contextText, setContextText] = useState(location.state?.context || '');
  const [showContext, setShowContext] = useState(!!location.state?.context);
  const [questionText, setQuestionText] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      sender: 'assistant',
      text: LOCALIZED_GREETINGS[settings.preferredLanguage || 'English'] || LOCALIZED_GREETINGS.English,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Speech Recognition Hook configured with the active talk language
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    changeLanguage,
  } = useSpeech({
    language: activeLang,
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

  // When active language is switched by user
  const handleLanguageChange = (newLang) => {
    setActiveLang(newLang);
    updateSettings({ preferredLanguage: newLang });
    changeLanguage(newLang);

    const localizedGreeting = LOCALIZED_GREETINGS[newLang] || LOCALIZED_GREETINGS.English;
    const newMsg = {
      sender: 'assistant',
      text: localizedGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Speak greeting in the newly selected language aloud
    speak(localizedGreeting, newLang);
  };

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
        language: activeLang,
      });

      if (res.data.success) {
        const answerText = res.data.result.answer;
        const assistantMessage = {
          sender: 'assistant',
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Speak answer back in the active language
        speak(answerText, activeLang);
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

  const quickQuestions = LOCALIZED_QUICK_QUESTIONS[activeLang] || LOCALIZED_QUICK_QUESTIONS.English;

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
          <span>Interactive Multilingual Voice Assistant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Voice Assistant
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Ask questions naturally in your preferred language. The assistant listens to your speech
          and answers spoken aloud in your chosen language.
        </p>
      </div>

      {/* Voice Language Selector Bar (All Required Options) */}
      <section
        aria-label="Select Voice Assistant Talk Language"
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <span>Voice Talk Language:</span>
          </label>
          <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
            Active: {activeLang}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ALL_LANGUAGES.map((lang) => (
            <button
              type="button"
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                activeLang === lang.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-pressed={activeLang === lang.id}
              aria-label={`Switch voice conversation language to ${lang.label}`}
            >
              <span className="text-sm">{lang.native}</span>
              <span className="text-[10px] opacity-80">{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

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
                  {msg.sender === 'user' ? 'You' : `AccessBridge Assistant (${activeLang})`}
                </span>
                <span className="text-[11px] opacity-70">{msg.time}</span>
              </div>
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <TTSButton
                    text={msg.text}
                    language={activeLang}
                    label="Replay Speech"
                  />
                  <span className="text-[11px] text-slate-500">{activeLang} Voice</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-slate-500">
            <LoadingSpinner message={`Assistant is generating answer in ${activeLang}...`} size="sm" />
          </div>
        )}
      </section>

      {/* Suggested Quick Questions in Selected Language */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase">Quick Questions ({activeLang}):</span>
        {quickQuestions.map((q, qIdx) => (
          <button
            key={qIdx}
            type="button"
            onClick={() => handleSend(q.query)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {q.label}
          </button>
        ))}
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
          Ask question by typing or speaking in {activeLang}
        </label>
        <input
          id="voice-query-input"
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={
            isListening
              ? `Listening to your speech in ${activeLang}...`
              : `Ask in ${activeLang} (Click Speak Query or type here)...`
          }
          className="flex-1 px-4 py-2.5 rounded-xl border-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !questionText.trim()}
          className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-40 transition-colors shadow-sm"
          aria-label={`Send question in ${activeLang}`}
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </main>
  );
}
