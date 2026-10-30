import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Languages,
  Ear,
  Mic,
  Sparkles,
  Accessibility,
  Contrast,
  Type,
  FileText,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import ResultCard from '../components/ResultCard';

const features = [
  { icon: Eye, t: 'See', d: 'Image descriptions for blind and low-vision users' },
  { icon: Languages, t: 'Understand', d: 'Plain language plus Tamil, Hindi and more' },
  { icon: Ear, t: 'Follow', d: 'Lecture notes and quizzes for deaf learners' },
  { icon: Mic, t: 'Speak', d: 'Voice questions with spoken answers' },
];

export default function Landing() {
  const { s, update } = useA11y();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-surface text-ink transition-colors">
      {/* Skip to Main Content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn-primary"
      >
        Skip to main content
      </a>

      {/* Accessible Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl p-1.5 focus-visible:outline-none"
          aria-label="AccessBridge Home"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white shadow-soft">
            <Accessibility size={22} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold text-ink">AccessBridge</span>
        </Link>

        {/* Quick Accessibility Controls Header */}
        <div className="flex items-center gap-3">
          <div
            role="toolbar"
            aria-label="Accessibility quick controls"
            className="flex items-center gap-2"
          >
            <button
              type="button"
              className="btn-ghost !min-h-[44px] !px-3"
              aria-label="Decrease text size"
              title="Decrease text size"
              onClick={() => update({ size: Math.max(14, s.size - 2) })}
            >
              <Type size={14} aria-hidden="true" />
              <span className="sr-only">Decrease text size</span>
            </button>
            <button
              type="button"
              className="btn-ghost !min-h-[44px] !px-3"
              aria-label="Increase text size"
              title="Increase text size"
              onClick={() => update({ size: Math.min(24, s.size + 2) })}
            >
              <Type size={20} aria-hidden="true" />
              <span className="sr-only">Increase text size</span>
            </button>
            <button
              type="button"
              className={`btn-ghost !min-h-[44px] !px-3 ${
                s.contrast ? 'bg-brand-100 text-brand-700 font-bold' : ''
              }`}
              aria-pressed={s.contrast}
              aria-label="Toggle high contrast"
              title="Toggle high contrast"
              onClick={() => update({ contrast: !s.contrast })}
            >
              <Contrast size={18} aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-semibold">Contrast</span>
            </button>
            <button
              type="button"
              className={`btn-ghost !min-h-[44px] hidden sm:inline-flex text-xs font-semibold ${
                s.dyslexia ? 'bg-brand-100 text-brand-700 font-bold' : ''
              }`}
              aria-pressed={s.dyslexia}
              aria-label="Toggle dyslexia readable font"
              title="Toggle dyslexia readable font"
              onClick={() => update({ dyslexia: !s.dyslexia })}
            >
              Dyslexia font
            </button>
          </div>

          <div className="h-6 w-px bg-line hidden sm:block" aria-hidden="true" />

          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary !min-h-[44px] text-sm">
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost !min-h-[44px] text-sm hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !min-h-[44px] text-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Container */}
      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-16 sm:py-20 text-center focus:outline-none">
        {/* Category Pill */}
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 border border-brand-200">
          <Sparkles size={16} aria-hidden="true" />
          <span>AI for Accessibility &amp; Inclusion</span>
        </p>

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-ink leading-tight">
          Information should be <span className="text-brand-700">understood</span> by everyone.
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted leading-relaxed">
          AccessBridge turns complex notices, forms and lessons into clear, spoken, translated
          content, personalized to how you read and listen.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-6 py-3.5">
            <span>Get started</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/login" className="btn-ghost text-base px-6 py-3.5">
            Sign in
          </Link>
          <Link to="/simplify" className="btn-ghost text-base px-6 py-3.5 border-brand-600 text-brand-700">
            Try Live Demo
          </Link>
        </div>

        {/* WCAG Compliance Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-muted">
          <ShieldCheck size={16} className="text-emerald-600" aria-hidden="true" />
          <span>WCAG 2.1 AA Compliant • 3px Focus Rings • SpeechSynthesis Supported</span>
        </div>

        {/* 4 Feature Cards */}
        <ul className="mt-16 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4" aria-label="Core Capabilities">
          {features.map(({ icon: I, t, d }) => (
            <li key={t} className="card hover:shadow-md transition-shadow">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4">
                <I size={24} aria-hidden="true" />
              </span>
              <h2 className="font-bold text-lg text-ink">{t}</h2>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">{d}</p>
            </li>
          ))}
        </ul>

        {/* Real Tamil Government Notice Interactive Demo Showcase */}
        <section className="mt-20 text-left space-y-6" aria-labelledby="live-demo-heading">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Real-World Impact
            </span>
            <h2 id="live-demo-heading" className="text-2xl sm:text-3xl font-extrabold text-ink">
              Tamil Nadu Government Notice Simplified
            </h2>
            <p className="text-muted text-sm sm:text-base">
              See how a complex official government gazette is transformed into plain language, 3 key
              points, action items, and spoken Tamil.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original Notice */}
            <div className="card space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
                <FileText size={16} aria-hidden="true" />
                <span>Original Government Gazette Notice</span>
              </div>
              <h3 className="font-bold text-base text-ink">
                தமிழ்நாடு அரசு மாற்றுத்திறனாளிகள் நலத்துறை – UDID அட்டை ஆணை
              </h3>
              <p className="text-sm text-muted leading-relaxed font-mono bg-surface p-4 rounded-xl border border-line">
                "மாற்றுத்திறனாளிகளுக்கான பிரத்யேக அடையாள அட்டை (UDID) வழங்குவது தொடர்பான அரசு வழிகாட்டுதல்கள்
                மற்றும் சலுகைகள் குறித்த அரசாணை எண் 42/2024. அனைத்து மாற்றுத்திறனாளிகளும் தங்களது மருத்துவச்
                சான்றிதழ் மற்றும் அடையாளச் சான்றுகளை சமர்ப்பித்து இச்சேவையைப் பெறலாம் என அறிவிக்கப்படுகிறது..."
              </p>
            </div>

            {/* AccessBridge Plain Tamil AI Result */}
            <div className="space-y-4">
              <ResultCard
                title="எளிய விளக்கம் (Plain Tamil)"
                text="உங்கள் தனித்துவ அடையாள அட்டை (UDID) பெறுவதற்கான வழிகாட்டி. இந்த அட்டை மூலம் அரசு பேருந்து இலவச பயணம் மற்றும் மாதாந்திர உதவித்தொகை பெறலாம்."
                lang="Tamil"
              />

              <ResultCard
                title="முக்கிய 3 குறிப்புகள் (Key Points)"
                text="1. தேவையானவை: ஆதார் அட்டை, மருத்துவச் சான்றிதழ், புகைப்படம். 2. எங்கு விண்ணப்பிப்பது: இ-சேவை மையம் அல்லது swavlambancard.gov.in. 3. உதவிக்கு: 1800-425-0111."
                lang="Tamil"
              >
                <div className="space-y-2 mt-2">
                  <div className="flex items-start gap-2 text-sm text-ink bg-surface p-3 rounded-xl border border-line">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>1. தேவையானவை:</strong> ஆதார், மருத்துவச் சான்றிதழ், பாஸ்போர்ட் புகைப்படம்</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-ink bg-surface p-3 rounded-xl border border-line">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>2. விண்ணப்பிக்கும் முறை:</strong> அருகிலுள்ள இ-சேவை மையம் அல்லது இணையதளம்</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-ink bg-surface p-3 rounded-xl border border-line">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>3. இலவச உதவி எண்:</strong> 1800-425-0111 என்ற எண்ணை அழைக்கலாம்</span>
                  </div>
                </div>
              </ResultCard>
            </div>
          </div>
        </section>
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-line bg-card py-8 text-center text-sm text-muted">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AccessBridge. Built for Universal Accessibility.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>WCAG 2.1 AA</span>
            <span>•</span>
            <span>High-Contrast Switcher</span>
            <span>•</span>
            <span>Dyslexia Typography</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
