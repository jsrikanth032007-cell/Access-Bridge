import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FileText,
  Eye,
  Mic,
  GraduationCap,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Simplify Content', path: '/simplify', icon: FileText },
        { name: 'Describe Image', path: '/describe-image', icon: Eye },
        { name: 'Voice Assistant', path: '/voice-assistant', icon: Mic },
        { name: 'Lecture Notes', path: '/lecture-notes', icon: GraduationCap },
        { name: 'History', path: '/history', icon: History },
      ]
    : [
        { name: 'Features', path: '/#features' },
        { name: 'How It Works', path: '/#how-it-works' },
        { name: 'Inclusion Vision', path: '/#vision' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 text-brand-700 dark:text-brand-400 font-extrabold text-xl focus:outline-none"
            aria-label="AccessBridge Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="tracking-tight text-slate-900 dark:text-white">
              Access<span className="text-brand-600 dark:text-brand-400">Bridge</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center space-x-1 lg:space-x-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300 font-bold border-b-2 border-brand-600'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth Buttons / Profile menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border flex items-center gap-1.5 transition-colors ${
                    isActive('/profile')
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  aria-label={`Open accessibility profile for ${user?.name || 'User'}`}
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span className="max-w-[120px] truncate">{user?.name || 'Profile'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1.5"
                  aria-label="Log out of your account"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-slate-900">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-semibold flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-slate-700 dark:text-slate-200"
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                  <span>Profile: {user?.name}</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-md border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-md bg-brand-600 text-white font-semibold shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
