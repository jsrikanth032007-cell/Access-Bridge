import React from 'react';
import { Heart, ShieldCheck, Keyboard, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      aria-label="Footer"
      className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <span>AccessBridge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering individuals with visual impairment, dyslexia, cognitive needs, hearing loss,
              and language barriers to independently access, understand, and interact with the digital world.
            </p>
          </div>

          {/* Accessibility Statement */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>WCAG 2.1 AA</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed with strict semantic HTML5, aria-live regions, full keyboard navigation,
              high-contrast themes, and dyslexia-friendly typography.
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-brand-400" aria-hidden="true" />
              <span>Keyboard Nav</span>
            </h2>
            <ul className="text-xs text-slate-400 space-y-1">
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Tab</kbd> Move focus forward</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Shift+Tab</kbd> Move focus back</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Enter / Space</kbd> Activate action</li>
            </ul>
          </div>

          {/* Supported Languages */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Multilingual Access
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Content simplification, synthesis, and speech feedback are supported across:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs text-brand-300">
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">English</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">தமிழ் (Tamil)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">हिन्दी (Hindi)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">తెలుగు (Telugu)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">മലയാളം (Malayalam)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">ಕನ್ನಡ (Kannada)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} AccessBridge. AI for Accessibility & Inclusion.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-label="love" /> for universal digital equity
          </span>
        </div>
      </div>
    </footer>
  );
}
