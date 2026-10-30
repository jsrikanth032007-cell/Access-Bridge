import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useA11y } from '../context/AccessibilityContext';
import api from '../services/api';
import {
  FileText,
  Image,
  Mic,
  Headphones,
  ArrowRight,
  Clock,
  Settings,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { s } = useA11y();
  const [recentHistory, setRecentHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecentHistory = async () => {
      try {
        const res = await api.get('/history');
        if (res.data.success && isMounted) {
          setRecentHistory(res.data.history.slice(0, 4));
        }
      } catch (err) {
        console.warn('Could not fetch recent history:', err.message);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    fetchRecentHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const featureCards = [
    {
      title: 'Simplify Text',
      description:
        'Transform dense notices, forms, PDF documents, or websites into plain language with 3 key points and translations.',
      path: '/simplify',
      icon: FileText,
      badge: 'Document & Web',
    },
    {
      title: 'Describe Image',
      description:
        'Upload graphics, charts, diagrams, or photos to generate screen-reader alt text, scene descriptions, and OCR text readout.',
      path: '/image',
      icon: Image,
      badge: 'Visual Assist',
    },
    {
      title: 'Voice Assistant',
      description:
        'Ask questions hands-free via speech-to-text. Receive spoken answers explaining difficult concepts or document instructions.',
      path: '/voice',
      icon: Mic,
      badge: 'Speech & Audio',
    },
    {
      title: 'Lecture Notes',
      description:
        'Turn transcripts or recorded audio into clear study summaries, key terminology glossaries, and a self-check quiz.',
      path: '/lecture',
      icon: Headphones,
      badge: 'Deaf/HoH & Study',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <section
        aria-label="Welcome and Accessibility Profile Status"
        className="card space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 border border-brand-200">
                <Sparkles size={13} aria-hidden="true" />
                <span>Active Assistant</span>
              </span>
              <span className="text-xs text-muted font-medium flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" aria-hidden="true" />
                <span>Profile Synced</span>
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Hello, {user?.name || user?.email?.split('@')[0] || 'Explorer'}!
            </h1>

            <p className="text-muted text-base max-w-2xl leading-relaxed">
              AccessBridge is actively optimizing content for your reading level and assistive
              preferences. Select a tool below or review your saved items.
            </p>
          </div>

          {/* Current Accessibility Snapshot */}
          <div className="rounded-xl border border-line bg-surface p-4 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Current Settings
              </span>
              <Link
                to="/profile"
                className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
                aria-label="Edit your accessibility profile"
              >
                <Settings size={14} aria-hidden="true" />
                <span>Edit</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted block text-[11px]">Reading Level</span>
                <span className="font-semibold text-ink">
                  {s.readingLevel || 'Simple'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Language</span>
                <span className="font-semibold text-ink">
                  {s.preferredLanguage || 'English'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Dyslexia Font</span>
                <span className="font-semibold text-ink">
                  {s.dyslexia ? 'Enabled' : 'Standard'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Theme</span>
                <span className="font-semibold text-ink">
                  {s.contrast ? 'High Contrast' : 'Default'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tools Grid */}
      <section aria-labelledby="tools-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="tools-heading" className="text-2xl font-bold text-ink tracking-tight">
              Accessibility Tools
            </h2>
            <p className="text-xs text-muted mt-0.5">Select a capability to begin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.path}
                className="group card hover:border-brand-600 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-700 text-white shadow-soft">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-ink group-hover:text-brand-700 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-sm text-muted leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-sm font-semibold text-brand-700">
                  <span>Open Tool</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Transformations Section */}
      <section aria-labelledby="history-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="history-heading" className="text-2xl font-bold text-ink tracking-tight">
            Recent Transformations
          </h2>
          <Link
            to="/history"
            className="text-sm font-bold text-brand-700 hover:underline flex items-center gap-1.5"
          >
            <span>View All Saved Items</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {isLoadingHistory ? (
          <div className="card text-center p-8 flex items-center justify-center gap-2 text-muted">
            <Loader2 className="animate-spin" size={20} aria-hidden="true" />
            <span className="text-sm">Loading recent history...</span>
          </div>
        ) : recentHistory.length === 0 ? (
          <div className="card text-center p-8 space-y-2">
            <Clock size={32} className="mx-auto text-muted" aria-hidden="true" />
            <p className="text-ink font-semibold text-sm">
              No saved transformations yet
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Simplify a legal document or upload an image to view your history here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentHistory.map((item) => (
              <div
                key={item._id || item.id}
                className="card !p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-muted mb-1.5">
                    <span className="font-semibold uppercase text-brand-700">
                      {item.featureType}
                    </span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink line-clamp-2">
                    {item.title}
                  </h4>
                </div>

                <Link
                  to="/history"
                  className="text-xs font-semibold text-brand-700 hover:underline pt-2 border-t border-line block"
                >
                  View Details &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
