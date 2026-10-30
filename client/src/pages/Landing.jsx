import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Eye,
  Mic,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Languages,
  BookOpen,
} from 'lucide-react';

export default function Landing() {
  return (
    <main id="main-content" tabIndex="-1" className="focus:outline-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-brand-50/60 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span>Universal Digital Inclusion Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AccessBridge
              <span className="block text-brand-600 dark:text-brand-400 mt-2">
                AI for Accessibility & Inclusion
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Complex government notices, medical instructions, legal policies, and educational
              lectures transformed into plain language, screen-reader descriptions, and multi-lingual
              spoken audio.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-base border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
              >
                <span>Try Demo Account</span>
              </Link>
            </div>

            {/* WCAG AA Compliance Pill */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Built to WCAG 2.1 AA Standards • Full Screen-Reader & Dyslexia Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences / The Need */}
      <section id="vision" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Who AccessBridge Helps
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Digital information is frequently written in exclusionary jargon. We bridge the gap for:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Visual Impairment & Low Vision
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Detailed AI scene descriptions, screen-reader alt text, visible text OCR readout, and
                high-contrast dark mode.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dyslexia & Reading Strain
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                One-click Lexend dyslexia-friendly typography, adjustable line spacing, and automated
                plain-language restructuring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cognitive & ADHD Support
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                3-bullet high-priority takeaways, step-by-step action checklists, and interactive
                difficult word glossaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Deaf & Hard-of-Hearing
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Audio and lecture transcripts converted into structured study notes, key terminology
                breakdowns, and learning quizzes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Languages className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Language & Translation Barriers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Direct translation and spoken voice synthesis across English, Tamil, Hindi, Telugu,
                Malayalam, and Kannada.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Mic className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Motor & Hands-Free Interaction
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Full voice query assistant with Web Speech API speech-to-text input and natural
                speech synthesis response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Assistive AI Feature Suite
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Four specialized tools engineered to make all digital content independently accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <FileText className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                1. Content Simplifier
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Paste difficult text, upload PDF/TXT documents, or input web URLs. Gemini AI generates
                plain-language versions calibrated to your reading level, 3 critical bullet points,
                action steps, an unfamiliar words glossary, and regional language translation.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>3 Reading Levels (Very Simple, Simple, Original)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>One-click audio text-to-speech narration</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <Eye className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                2. Image & Scene Describer
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Upload transit maps, infocards, charts, or photos. AccessBridge inspects the image to
                generate concise screen-reader alt text, a deep spatial description for blind users, and
                OCR transcription of any text inside the image.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Screen-reader optimized alt-text copyable in 1 click</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>OCR text detection read out loud automatically</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <Mic className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                3. Voice Assistant
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Ask clarifying questions using your voice via Web Speech API speech-to-text. Ask
                "Explain paragraph 2 again", "What is the deadline?", or "What documents do I need to
                bring?". The assistant answers back spoken in natural audio.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Hands-free voice recognition and audio playback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Context-aware Q&A based on simplified documents</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                4. Audio & Lecture Notes
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Paste spoken transcripts or lecture recordings. AccessBridge creates a structured
                visual summary, defines key domain terms, and generates an interactive 3-question quiz
                with immediate feedback to support deaf/HoH students and ADHD learners.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Structured headings for easy visual scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                  <span>Self-assessment comprehension quiz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-brand-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Accessing Complex Information Independently
          </h2>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">
            Experience our seeded demo account with pre-loaded medical records, transit guides, and
            lecture notes with personalized dyslexia and screen-reader profiles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white text-brand-700 font-bold hover:bg-brand-50 transition-colors shadow-md"
            >
              Sign In to Demo Account
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-brand-700 text-white font-bold hover:bg-brand-800 transition-colors border border-brand-500"
            >
              Create Personalized Profile
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

