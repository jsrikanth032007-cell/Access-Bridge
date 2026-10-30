import React from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Image,
  Mic,
  Headphones,
  History,
  User,
  Type,
  Contrast,
  Accessibility,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useA11y } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/simplify', label: 'Simplify Text', icon: FileText },
  { to: '/image', label: 'Describe Image', icon: Image },
  { to: '/voice', label: 'Voice Assistant', icon: Mic },
  { to: '/lecture', label: 'Lecture Notes', icon: Headphones },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function AppShell() {
  const { s, update } = useA11y();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isNavActive = (to) => {
    const p = location.pathname;
    if (to === '/image') return p === '/image' || p === '/describe-image';
    if (to === '/voice') return p === '/voice' || p === '/voice-assistant';
    if (to === '/lecture') return p === '/lecture' || p === '/lecture-notes';
    return p === to;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink lg:grid lg:grid-cols-[260px_1fr]">
      {/* Skip to Main Content Link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 btn-primary shadow-lg"
      >
        Skip to main content
      </a>

      {/* Sidebar (Desktop) */}
      <aside
        className="hidden border-r border-line bg-card lg:flex lg:flex-col lg:justify-between lg:p-5"
        aria-label="Sidebar navigation"
      >
        <div>
          <Link
            to="/dashboard"
            className="mb-8 flex items-center gap-3 rounded-xl p-2 hover:bg-brand-50 transition-colors focus-visible:outline-none"
            aria-label="AccessBridge Home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white shadow-soft">
              <Accessibility size={22} aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-ink">AccessBridge</span>
              <span className="text-xs font-medium text-muted mt-1">Assistive AI Portal</span>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="flex flex-col gap-1.5">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = isNavActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition min-h-[44px] ${
                    active
                      ? 'bg-brand-100 text-brand-700 font-semibold shadow-xs'
                      : 'text-muted hover:bg-brand-50 hover:text-ink'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Desktop Sidebar */}
        <div className="border-t border-line pt-4 space-y-2">
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-line">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-ink truncate">
                  {user?.name || user?.email || 'Active User'}
                </p>
                <p className="text-[11px] text-muted truncate">
                  {s.preferredLanguage || 'English'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost !min-h-[38px] !px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-ghost !min-h-[40px] text-xs flex-1 text-center">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !min-h-[40px] text-xs flex-1 text-center">
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar: quick accessibility controls */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              <Sparkles size={13} aria-hidden="true" />
              <span>WCAG AA Ready</span>
            </span>
            <h1 className="text-sm font-semibold text-muted truncate">
              AI for Accessibility &amp; Inclusion
            </h1>
          </div>

          <div
            role="toolbar"
            aria-label="Accessibility quick controls"
            className="flex items-center gap-2"
          >
            {/* Decrease Font Size */}
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

            {/* Increase Font Size */}
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

            {/* High Contrast Toggle */}
            <button
              type="button"
              className={`btn-ghost !min-h-[44px] !px-3 ${
                s.contrast ? 'bg-brand-100 text-brand-700 font-bold' : ''
              }`}
              aria-pressed={s.contrast}
              aria-label="Toggle high contrast mode"
              title="Toggle high contrast mode"
              onClick={() => update({ contrast: !s.contrast })}
            >
              <Contrast size={18} aria-hidden="true" />
              <span className="hidden md:inline text-xs font-semibold">Contrast</span>
            </button>

            {/* Dyslexia Mode Toggle */}
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
        </header>

        {/* Main Content Area */}
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-28 lg:px-8 lg:pb-8 focus:outline-none"
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-card lg:hidden shadow-lg"
      >
        {nav.slice(0, 5).map(({ to, label, icon: Icon }) => {
          const active = isNavActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[48px] text-[11px] font-medium transition ${
                active ? 'text-brand-700 font-bold' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

