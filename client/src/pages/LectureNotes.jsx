import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  Award,
  RefreshCw,
  Languages,
  Mic,
  MicOff,
} from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import { useSpeech } from '../hooks/useSpeech';
import ResultCard from '../components/ResultCard';
import api from '../services/api';

const ALL_LANGUAGES = [
  { id: 'English', label: 'English', native: 'English' },
  { id: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { id: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { id: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { id: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { id: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const SAMPLE_LECTURES = [
  {
    name: 'Human Biology (Circulation)',
    lang: 'English',
    text: `Welcome to Biology 101. Today we discuss the mammalian cardiovascular system. The heart functions as a dual-pump muscular organ comprising four distinct chambers: the right atrium and right ventricle, which handle deoxygenated blood arriving from systemic veins, and the left atrium and left ventricle, which receive freshly oxygenated blood from the pulmonary veins. Contraction of the ventricles is called systole, while ventricular relaxation and chamber filling is called diastole. The sinoatrial (SA) node acts as the heart's natural intrinsic pacemaker, generating electrical impulses that propagate across the atria down to the atrioventricular (AV) node. Arteries carry blood away from the heart under high hydrostatic pressure, whereas veins contain one-way valves that prevent retrograde flow as blood returns back under low pressure.`,
  },
  {
    name: 'Computer Science (Binary Trees)',
    lang: 'English',
    text: `In this lecture, we examine hierarchical data structures, specifically Binary Search Trees (BSTs). In a standard binary tree, each node has at most two children: designated left and right child pointers. The fundamental invariant of a BST requires that every key stored in a node's left subtree must be strictly less than the node's own key, and every key in the right subtree must be strictly greater than or equal to the node's key. For a balanced tree with N elements, common operations such as insertion, search, and deletion run in O(log N) time complexity. However, if keys are inserted in sorted monotonic order without self-balancing mechanisms, the tree degrades into a linked list with worst-case O(N) linear time complexity. Traversal orders include in-order, which visits keys in sorted ascending order.`,
  },
];

export default function LectureNotes() {
  const { s } = useA11y();
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState(s.preferredLanguage || 'English');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Voice speech dictation hook
  const {
    isListening,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    changeLanguage,
  } = useSpeech({
    language,
    onResult: (text) => {
      setTranscript((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  useEffect(() => {
    if (changeLanguage) {
      changeLanguage(language);
    }
  }, [language, changeLanguage]);

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (sample) => {
    setTranscript(sample.text);
    if (sample.lang) setLanguage(sample.lang);
    setError('');
    setResult(null);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim() || transcript.trim().length < 10) {
      setError('Please paste or speak a transcript of at least 10 characters.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setResult(null);
      setSelectedAnswers({});
      setSubmittedQuiz(false);

      const res = await api.post('/ai/lecture-notes', {
        transcript: transcript.trim(),
        language,
      });

      if (res.data.success && res.data.result) {
        setResult(res.data.result);
      } else {
        setError('Could not generate lecture notes. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to generate lecture notes. Please verify your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIdx, option) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const calculateScore = () => {
    if (!result?.quiz) return 0;
    return result.quiz.reduce((score, q, idx) => {
      return selectedAnswers[idx] === q.correctAnswer ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-ink">Audio & Lecture Notes</h2>
        <p className="mt-1 text-muted text-base leading-relaxed">
          Convert audio transcripts and educational lectures into clean structured summaries, key
          vocabulary definitions, and a 3-question self-assessment quiz designed for deaf/hard-of-hearing
          students and ADHD learners.
        </p>
      </header>

      {/* Main Form Card */}
      <section className="card space-y-6" aria-labelledby="lecture-input-heading">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="lecture-languages"
                className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5"
              >
                <Languages size={15} className="text-brand-700" aria-hidden="true" />
                <span>Notes &amp; Quiz Language:</span>
              </label>

              {/* Sample Buttons for Demo/Judges */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted hidden sm:inline">Try Sample:</span>
                {SAMPLE_LECTURES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => loadSample(sample)}
                    className="btn-ghost !min-h-[38px] !px-2.5 text-xs text-brand-700 hover:bg-brand-100"
                  >
                    {sample.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div id="lecture-languages" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ALL_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`btn-ghost !min-h-[44px] !px-3 text-xs flex flex-col items-center justify-center ${
                    language === lang.id
                      ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold shadow-soft'
                      : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={language === lang.id}
                  aria-label={`Set study notes language to ${lang.label}`}
                >
                  <span className="text-sm font-semibold">{lang.native}</span>
                  <span className="text-[10px] opacity-80">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transcript Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="lecture-transcript"
                className="font-semibold text-ink text-base"
              >
                Lecture or Audio Transcript
              </label>
              <div className="flex items-center gap-2">
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`btn-ghost !min-h-[40px] !px-3 text-xs font-semibold ${
                      isListening ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse' : ''
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Dictate transcript with microphone'}
                  >
                    {isListening ? (
                      <>
                        <MicOff size={16} aria-hidden="true" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={16} aria-hidden="true" />
                        <span>Dictate</span>
                      </>
                    )}
                  </button>
                )}

                <div>
                  <input
                    id="lecture-file"
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor="lecture-file"
                    className="btn-ghost !min-h-[40px] !px-3 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload size={14} aria-hidden="true" />
                    <span>Upload .txt</span>
                  </label>
                </div>
              </div>
            </div>

            <textarea
              id="lecture-transcript"
              rows={7}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={
                isListening
                  ? `Listening to your lecture audio in ${language}...`
                  : 'Paste transcript text, classroom lecture recording, or upload a .txt file...'
              }
              className="input focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="btn-primary w-full text-base !min-h-[48px]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} aria-hidden="true" />
            ) : (
              <Sparkles size={20} aria-hidden="true" />
            )}
            <span>
              {isLoading
                ? `Generating Notes & Quiz in ${language}…`
                : `Generate Notes & Comprehension Quiz (${language})`}
            </span>
          </button>
        </form>
      </section>

      {/* Screen Readers Live Region */}
      <div aria-live="polite" aria-busy={isLoading} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
          >
            <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={20} aria-hidden="true" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-brand-700" aria-hidden="true" />
                <span className="font-bold text-brand-700 text-sm">
                  Study Guide Ready ({language})
                </span>
              </div>
              <span className="text-xs font-semibold text-muted font-mono">
                {result.title}
              </span>
            </div>

            {/* 1. Structured Summary Card */}
            <ResultCard
              title={result.title || 'Structured Lecture Summary'}
              text={result.summary}
              lang={language}
            />

            {/* 2. Key Terms & Concepts */}
            {result.keyTerms?.length > 0 && (
              <ResultCard title="Key Vocabulary & Concepts" lang={language}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {result.keyTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface border border-line space-y-1"
                    >
                      <h4 className="font-bold text-brand-700 text-sm">{term.term}</h4>
                      <p className="text-xs text-muted leading-relaxed">
                        {term.explanation || term.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* 3. Comprehension Self-Check Quiz */}
            {result.quiz?.length > 0 && (
              <section className="card space-y-6" aria-labelledby="quiz-heading">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={22} className="text-amber-500" aria-hidden="true" />
                    <h3 id="quiz-heading" className="text-xl font-bold text-ink">
                      Comprehension Self-Check Quiz
                    </h3>
                  </div>

                  {submittedQuiz && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 border border-brand-200">
                      Score: {calculateScore()} / {result.quiz.length}
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {result.quiz.map((q, qIdx) => (
                    <fieldset
                      key={qIdx}
                      className="p-5 rounded-xl bg-surface border border-line space-y-3"
                    >
                      <legend className="font-bold text-sm sm:text-base text-ink mb-2">
                        Question {qIdx + 1}: {q.question}
                      </legend>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[qIdx] === opt;
                          const isCorrect = opt === q.correctAnswer;

                          let optionStyle =
                            'bg-card border-line text-ink hover:bg-brand-50';
                          if (submittedQuiz) {
                            if (isCorrect) {
                              optionStyle =
                                'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                            } else if (isSelected && !isCorrect) {
                              optionStyle =
                                'bg-rose-50 border-rose-500 text-rose-950 line-through';
                            }
                          } else if (isSelected) {
                            optionStyle =
                              'bg-brand-100 border-brand-600 text-brand-700 font-semibold';
                          }

                          return (
                            <label
                              key={oIdx}
                              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors text-sm min-h-[44px] ${optionStyle}`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIdx}`}
                                value={opt}
                                checked={isSelected}
                                disabled={submittedQuiz}
                                onChange={() => handleSelectOption(qIdx, opt)}
                                className="w-4 h-4 text-brand-700 focus:ring-brand-600"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div className="pt-2 text-xs text-muted border-t border-line mt-2">
                          <strong className="text-ink">Explanation: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </fieldset>
                  ))}
                </div>

                {!submittedQuiz ? (
                  <button
                    type="button"
                    onClick={() => setSubmittedQuiz(true)}
                    disabled={Object.keys(selectedAnswers).length < result.quiz.length}
                    className="btn-primary !min-h-[44px] text-sm disabled:opacity-50"
                  >
                    Submit Quiz &amp; Check Answers
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setSubmittedQuiz(false);
                    }}
                    className="btn-ghost !min-h-[44px] text-sm flex items-center gap-2"
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    <span>Retake Quiz</span>
                  </button>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
