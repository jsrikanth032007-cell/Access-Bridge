import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  AlertTriangle,
  Loader2,
  MessageSquare,
  FileText,
  Languages,
  Square,
  Copy,
  Check,
} from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import { useSpeech } from '../hooks/useSpeech';
import api from '../services/api';

const ALL_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const LOCALIZED_GREETINGS = {
  English:
    'Hello! I am your AccessBridge Voice Assistant. Click the microphone button below to ask a question, and I will speak the answer back to you.',
  Tamil:
    'வணக்கம்! நான் உங்கள் AccessBridge குரல் உதவியாளர். பேச மைக்ரோஃபோன் பொத்தானை அழுத்தவும் அல்லது உங்கள் கேள்வியை தட்டச்சு செய்யவும். தமிழில் பதிலளிப்பேன்.',
  Hindi:
    'नमस्ते! मैं आपका AccessBridge वॉयस असिस्टेंट हूँ। बोलने के लिए माइक बटन पर क्लिक करें या अपना प्रश्न लिखें। मैं हिंदी में बोलकर उत्तर दूंगा।',
  Telugu:
    'నమస్కారం! నేను మీ AccessBridge వాయిస్ అసిస్టెంట్‌ని. మాట్లాడటానికి మైక్రోఫోన్ బటన్‌ను క్లిక్ చేయండి. నేను తెలుగులో సమాధానం చెబుతాను.',
  Malayalam:
    'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AccessBridge വോയ്‌സ് അസിസ്റ്റന്റാണ്. സംസാരിക്കാൻ മൈക്രോഫോൺ ബട്ടൺ ക്ലിക്കുചെയ്യുക. ഞാൻ മലയാളത്തിൽ സംസാരിക്കും.',
  Kannada:
    'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AccessBridge ಧ್ವನಿ ಸಹಾಯಕ. ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ನಾನು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸುತ್ತೇನೆ.',
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
  const { s, update, speakText } = useA11y();
  const location = useLocation();

  const [activeLang, setActiveLang] = useState(s.preferredLanguage || 'English');
  const [contextText, setContextText] = useState(location.state?.context || '');
  const [showContext, setShowContext] = useState(!!location.state?.context);
  const [questionText, setQuestionText] = useState('');
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  const [messages, setMessages] = useState(() => [
    {
      sender: 'assistant',
      text: LOCALIZED_GREETINGS[s.preferredLanguage || 'English'] || LOCALIZED_GREETINGS.English,
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
    changeLanguage,
  } = useSpeech({
    language: activeLang,
    onResult: (text) => {
      setQuestionText(text);
    },
  });

  useEffect(() => {
    if (transcript) {
      setQuestionText(transcript);
    }
  }, [transcript]);

  // Handle switching language
  const handleLanguageChange = (newLang) => {
    setActiveLang(newLang);
    update({ preferredLanguage: newLang });
    if (changeLanguage) changeLanguage(newLang);

    const localizedGreeting = LOCALIZED_GREETINGS[newLang] || LOCALIZED_GREETINGS.English;
    const newMsg = {
      sender: 'assistant',
      text: localizedGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Speak greeting in the newly selected language aloud
    playSpeechUtterance(localizedGreeting, newLang);
  };

  const playSpeechUtterance = (textToSpeak, langName) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langMap = {
      English: 'en-US',
      Tamil: 'ta-IN',
      Hindi: 'hi-IN',
      Telugu: 'te-IN',
      Malayalam: 'ml-IN',
      Kannada: 'kn-IN',
    };
    utterance.lang = langMap[langName] || 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMsgSpeech = (msgText, idx) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
    } else {
      setSpeakingMsgIdx(idx);
      playSpeechUtterance(msgText, activeLang);
    }
  };

  const handleCopy = (msgText, idx) => {
    navigator.clipboard.writeText(msgText);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
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

      if (res.data.success && res.data.result) {
        const answerText = res.data.result.answer;
        const assistantMessage = {
          sender: 'assistant',
          text: answerText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        playSpeechUtterance(answerText, activeLang);
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
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Voice Assistant</h2>
        <p className="mt-1 text-muted text-base leading-relaxed">
          Ask questions naturally in your preferred language. The assistant listens to your speech
          and answers spoken aloud in your chosen language.
        </p>
      </header>

      {/* Voice Talk Language Selector */}
      <section
        aria-label="Select Voice Assistant Talk Language"
        className="card space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Languages size={15} className="text-brand-700" aria-hidden="true" />
            <span>Voice Talk Language:</span>
          </label>
          <span className="text-xs font-semibold text-brand-700">
            Active: {activeLang}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ALL_LANGUAGES.map((lang) => (
            <button
              type="button"
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`btn-ghost !min-h-[44px] !px-3 text-xs flex flex-col items-center justify-center ${
                activeLang === lang.id
                  ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold shadow-soft'
                  : 'text-muted hover:text-ink'
              }`}
              aria-pressed={activeLang === lang.id}
              aria-label={`Switch voice conversation language to ${lang.label}`}
            >
              <span className="text-sm font-semibold">{lang.native}</span>
              <span className="text-[10px] opacity-80">{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Context Drawer (Document background) */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowContext(!showContext)}
            className="btn-ghost !min-h-[40px] text-xs font-semibold text-ink flex items-center gap-2"
            aria-expanded={showContext}
          >
            <FileText size={16} className="text-brand-700" aria-hidden="true" />
            <span>
              {contextText ? 'Document Context Attached' : 'Attach Document Context (Optional)'}
            </span>
          </button>
          {contextText && (
            <button
              type="button"
              onClick={() => setContextText('')}
              className="btn-ghost !min-h-[36px] text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear Context
            </button>
          )}
        </div>

        {showContext && (
          <textarea
            id="context-input"
            rows={3}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Paste any document snippet, policy, or notes you want to ask questions about..."
            className="input text-sm"
            aria-label="Document Background Context"
          />
        )}
      </div>

      {/* Speech / API Error Alert */}
      {(error || speechError) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
        >
          <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={20} aria-hidden="true" />
          <span className="text-sm font-medium">{error || speechError}</span>
        </div>
      )}

      {/* Conversation Messages Container */}
      <section
        aria-live="polite"
        aria-label="Conversation Messages"
        className="card space-y-4 min-h-[380px] max-h-[520px] overflow-y-auto"
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
                  ? 'bg-brand-700 text-white shadow-soft rounded-br-sm'
                  : 'bg-surface text-ink border border-line shadow-soft rounded-bl-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-xs opacity-80">
                <span className="font-bold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'You' : `AccessBridge Assistant (${activeLang})`}
                </span>
                <span className="text-[11px]">{msg.time}</span>
              </div>

              <p className="whitespace-pre-line text-sm sm:text-base">{msg.text}</p>

              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMsgSpeech(msg.text, idx)}
                      className="btn-ghost !min-h-[36px] !px-2.5 text-xs text-brand-700"
                      aria-label={
                        speakingMsgIdx === idx ? 'Stop speaking answer' : 'Listen to answer aloud'
                      }
                      aria-pressed={speakingMsgIdx === idx}
                    >
                      {speakingMsgIdx === idx ? (
                        <>
                          <Square size={14} aria-hidden="true" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} aria-hidden="true" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, idx)}
                      className="btn-ghost !min-h-[36px] !px-2.5 text-xs text-muted"
                      aria-label="Copy answer to clipboard"
                    >
                      {copiedMsgIdx === idx ? (
                        <Check size={14} className="text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy size={14} aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-muted">{activeLang} Voice</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-muted">
            <Loader2 className="animate-spin text-brand-700" size={18} aria-hidden="true" />
            <span className="text-xs font-medium">Assistant is formulating response in {activeLang}…</span>
          </div>
        )}
      </section>

      {/* Suggested Quick Questions in Selected Language */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-muted uppercase tracking-wider block">
          Quick Questions ({activeLang}):
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {quickQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => handleSend(q.query)}
              className="btn-ghost !min-h-[40px] !px-3 text-xs font-medium hover:border-brand-600 hover:bg-brand-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice and Text Input Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="card !p-3 flex items-center gap-2 shadow-soft"
      >
        {/* Microphone Button */}
        {isSpeechSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`btn-ghost !min-h-[44px] !px-3.5 flex items-center gap-1.5 ${
              isListening
                ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse font-bold'
                : 'text-brand-700 hover:bg-brand-50'
            }`}
            aria-label={
              isListening ? 'Stop recording speech' : `Speak your question in ${activeLang}`
            }
            aria-pressed={isListening}
          >
            {isListening ? (
              <>
                <MicOff size={18} aria-hidden="true" />
                <span className="hidden sm:inline text-xs">Listening</span>
              </>
            ) : (
              <>
                <Mic size={18} aria-hidden="true" />
                <span className="hidden sm:inline text-xs">Speak</span>
              </>
            )}
          </button>
        )}

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
              ? `Listening in ${activeLang}...`
              : `Ask in ${activeLang} (Click Speak or type here)...`
          }
          className="input !py-2.5 flex-1 text-base focus:outline-none"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !questionText.trim()}
          className="btn-primary !min-h-[44px] !px-4 disabled:opacity-40"
          aria-label={`Send question in ${activeLang}`}
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
