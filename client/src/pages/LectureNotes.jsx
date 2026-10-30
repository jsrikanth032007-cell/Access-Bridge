import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import api from '../services/api.js';
import {
  GraduationCap,
  Sparkles,
  AlertCircle,
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton } from '../components/SpeechControls.jsx';

export default function LectureNotes() {
  const { settings } = useAccessibility();
  const [transcript, setTranscript] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim() || transcript.trim().length < 10) {
      setError('Please paste or upload a transcript of at least 10 characters.');
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
        language: settings.preferredLanguage || 'English',
      });

      if (res.data.success) {
        setResult(res.data.result);
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
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Deaf/HoH & Learning Support</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Audio & Lecture Notes
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Convert audio transcripts and educational lectures into clean structured summaries, key
          vocabulary definitions, and a 3-question self-assessment quiz designed for deaf/hard-of-hearing
          students and ADHD learners.
        </p>
      </div>

      {/* Form Card */}
      <section
        aria-label="Lecture Transcript Input"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
      >
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="lecture-transcript"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Lecture or Audio Transcript:
              </label>
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
                  className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Upload .txt transcript</span>
                </label>
              </div>
            </div>

            <textarea
              id="lecture-transcript"
              rows="7"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste recorded audio transcription, meeting notes, or classroom lecture text..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner message="Generating accessible lecture notes & quiz..." size="sm" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Generate Notes & Comprehension Quiz</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Results Section */}
      {result && (
        <section
          aria-live="polite"
          aria-label="Lecture Notes & Quiz Results"
          className="space-y-6 pt-4 animate-fadeIn"
        >
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <div>
              <span className="text-xs font-bold uppercase text-purple-700 dark:text-purple-300">
                Study Guide Ready
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.title}
              </h2>
            </div>
            <TTSButton text={`${result.title}. ${result.summary}`} label="Read Summary Aloud" />
          </div>

          {/* (1) Structured Summary */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" aria-hidden="true" />
              <span>Structured Lecture Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line text-base">
              {result.summary}
            </div>
          </div>

          {/* (2) Key Terms */}
          {result.keyTerms && result.keyTerms.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" aria-hidden="true" />
                <span>Key Vocabulary & Concepts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.keyTerms.map((term, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-1"
                  >
                    <span className="font-bold text-purple-900 dark:text-purple-300 text-sm block">
                      {term.term}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {term.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* (3) Self-Check Quiz */}
          {result.quiz && result.quiz.length > 0 && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  <span>Comprehension Self-Check Quiz</span>
                </h3>

                {submittedQuiz && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Score: {calculateScore()} / {result.quiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {result.quiz.map((q, qIdx) => (
                  <fieldset
                    key={qIdx}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <legend className="font-bold text-base text-slate-900 dark:text-white mb-2">
                      Question {qIdx + 1}: {q.question}
                    </legend>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === opt;
                        const isCorrect = opt === q.correctAnswer;

                        let optionStyle =
                          'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
                        if (submittedQuiz) {
                          if (isCorrect) {
                            optionStyle =
                              'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle =
                              'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 line-through';
                          }
                        } else if (isSelected) {
                          optionStyle =
                            'bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-900 dark:text-brand-100 font-semibold';
                        }

                        return (
                          <label
                            key={oIdx}
                            className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${optionStyle}`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              value={opt}
                              checked={isSelected}
                              disabled={submittedQuiz}
                              onChange={() => handleSelectOption(qIdx, opt)}
                              className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold">Explanation:</span> {q.explanation}
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
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  Submit Quiz & Check Answers
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers({});
                    setSubmittedQuiz(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Retake Quiz</span>
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
