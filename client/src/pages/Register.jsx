import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/AccessibilityContext';
import {
  UserPlus,
  AlertTriangle,
  ArrowRight,
  Accessibility,
  Contrast,
  Type,
  Loader2,
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { s, update } = useA11y();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password);
      navigate('/profile');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again with a different email address.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Bar with Logo & Quick Accessibility Toolbar */}
      <header className="flex items-center justify-between border-b border-line bg-card/90 px-4 py-3 backdrop-blur lg:px-8">
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

        {/* Quick Accessibility Controls */}
        <div
          role="toolbar"
          aria-label="Accessibility quick controls"
          className="flex items-center gap-2"
        >
          <button
            type="button"
            className="btn-ghost !min-h-[44px] !px-3"
            aria-label="Decrease text size"
            onClick={() => update({ size: Math.max(14, s.size - 2) })}
          >
            <Type size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-ghost !min-h-[44px] !px-3"
            aria-label="Increase text size"
            onClick={() => update({ size: Math.min(24, s.size + 2) })}
          >
            <Type size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`btn-ghost !min-h-[44px] !px-3 ${
              s.contrast ? 'bg-brand-100 text-brand-700 font-bold' : ''
            }`}
            aria-pressed={s.contrast}
            aria-label="Toggle high contrast"
            onClick={() => update({ contrast: !s.contrast })}
          >
            <Contrast size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`btn-ghost !min-h-[44px] hidden sm:inline-flex text-xs font-semibold ${
              s.dyslexia ? 'bg-brand-100 text-brand-700 font-bold' : ''
            }`}
            aria-pressed={s.dyslexia}
            aria-label="Toggle dyslexia readable font"
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
        className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 focus:outline-none"
      >
        <div className="card max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white mx-auto shadow-soft">
              <UserPlus size={24} aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">
              Create AccessBridge Account
            </h1>
            <p className="text-sm text-muted">
              Personalize your assistive reading level, dyslexia fonts, and voice assistance.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-sm"
            >
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-bold uppercase text-muted mb-1.5"
              >
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input focus:outline-none"
                placeholder="e.g. Maya Sharma"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-bold uppercase text-muted mb-1.5"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold uppercase text-muted mb-1.5"
              >
                Password (min 6 characters)
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full !min-h-[48px] text-base"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted pt-2 border-t border-line">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-brand-700 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-line bg-card py-4 text-center text-xs text-muted">
        © 2026 AccessBridge. Built for Universal Accessibility.
      </footer>
    </div>
  );
}
