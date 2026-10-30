import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import api from '../services/api.js';
import {
  FileText,
  Eye,
  Mic,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Settings,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [recentHistory, setRecentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      try {
        const res = await api.get('/history');
        if (res.data.success) {
          setRecentHistory(res.data.history.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not fetch recent history:', err.message);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchRecentHistory();
  }, []);

  const featureCards = [
    {
      title: 'Content Simplifier',
      description:
        'Transform dense text, PDF/TXT documents, or websites into plain language with 3 key points, action steps, and translations.',
      path: '/simplify',
      icon: FileText,
      color: 'bg-blue-600',
      badge: 'Document & Web',
    },
    {
      title: 'Image Describer',
      description:
        'Upload graphics, maps, documents, or photos to generate alt-text for screen readers, detailed descriptions, and OCR text readout.',
      path: '/describe-image',
      icon: Eye,
      color: 'bg-emerald-600',
      badge: 'Visual Assist',
    },
    {
      title: 'Voice Assistant',
      description:
        'Ask questions hands-free via speech-to-text. Receive spoken answers explaining difficult concepts or document deadlines.',
      path: '/voice-assistant',
      icon: Mic,
      color: 'bg-amber-600',
      badge: 'Speech Interactive',
    },
    {
      title: 'Lecture & Audio Notes',
      description:
        'Turn transcripts or recorded audio into clear summaries, glossary definitions, and a 3-question self-check quiz.',
      path: '/lecture-notes',
      icon: GraduationCap,
      color: 'bg-purple-600',
      badge: 'Deaf/HoH & Study',
    },
  ];

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Welcome Banner */}
      <section
        aria-label="Welcome and Accessibility Profile Status"
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                Active Assistant
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Profile Synced
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Hello, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base max-w-2xl">
              AccessBridge is actively optimizing content for your reading level and assistive
              preferences. Choose a tool below or review your saved items.
            </p>
          </div>

          {/* Quick Profile Summary Badge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Current Settings
              </span>
              <Link
                to="/profile"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                aria-label="Edit your accessibility profile"
              >
                <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Reading Level</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {settings.readingLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Language</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {settings.preferredLanguage}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Dyslexia Font</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {settings.dyslexiaFont ? 'Enabled' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contrast</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {settings.highContrast ? 'High' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section aria-labelledby="tools-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="tools-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
            Accessibility Tools
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Select a capability to begin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.path}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500 dark:hover:border-brand-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl ${tool.color} text-white flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-brand-600 dark:text-brand-400">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent History Highlights */}
      <section aria-labelledby="history-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="history-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
            Recent Transformations
          </h2>
          <Link
            to="/history"
            className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Saved Items</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {isLoadingHistory ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <LoadingSpinner message="Loading your recent history..." size="md" />
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No transformations saved yet.
            </p>
            <p className="text-xs text-slate-500">
              Simplify a legal document or describe an image to view it saved here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentHistory.map((item) => (
              <div
                key={item._id || item.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase text-brand-600 dark:text-brand-400">
                      {item.featureType}
                    </span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <Link
                  to="/history"
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 block"
                >
                  View Details &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
