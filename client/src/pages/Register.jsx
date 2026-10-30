import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Register() {
  const { register } = useAuth();
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
      // Direct new users to customize their accessibility profile right away
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
    <main
      id="main-content"
      tabIndex="-1"
      className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 focus:outline-none"
    >
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 rounded-xl mx-auto flex items-center justify-center text-white shadow-sm">
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create AccessBridge Profile
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Set up your universal accessibility assistant for simplified learning and content access
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="reg-name"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
            >
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-colors text-base"
              placeholder="e.g. Maya Chen"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
            >
              Email Address <span className="text-rose-600">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-colors text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="reg-password"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1"
            >
              Password (min. 6 characters) <span className="text-rose-600">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-colors text-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoadingSpinner message="Creating account..." size="sm" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
          <span>Already registered? </span>
          <Link
            to="/login"
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </main>
  );
}

