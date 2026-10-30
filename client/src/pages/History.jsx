import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  History as HistoryIcon,
  Trash2,
  Eye,
  FileText,
  GraduationCap,
  Sparkles,
  AlertCircle,
  X,
  Calendar,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { TTSButton } from '../components/SpeechControls.jsx';

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/history');
      if (res.data.success) {
        setHistoryList(res.data.history);
      }
    } catch (err) {
      setError('Could not load history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistoryList((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (selectedItem && (selectedItem._id || selectedItem.id) === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      setError('Failed to delete item from history.');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredItems = historyList.filter((item) => {
    if (filterType === 'all') return true;
    return item.featureType === filterType;
  });

  const getFeatureIcon = (type) => {
    switch (type) {
      case 'simplify':
        return <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />;
      case 'describe-image':
        return <Eye className="w-5 h-5 text-emerald-600" aria-hidden="true" />;
      case 'lecture-notes':
        return <GraduationCap className="w-5 h-5 text-purple-600" aria-hidden="true" />;
      default:
        return <HistoryIcon className="w-5 h-5 text-slate-500" aria-hidden="true" />;
    }
  };

  return (
    <main
      id="main-content"
      tabIndex="-1"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none space-y-8"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <HistoryIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saved Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Accessibility History
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Review, re-read, and manage your past AI simplifications, image descriptions, and lecture notes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({historyList.length})
          </button>
          <button
            onClick={() => setFilterType('simplify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'simplify'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Simplifications
          </button>
          <button
            onClick={() => setFilterType('describe-image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'describe-image'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setFilterType('lecture-notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'lecture-notes'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Lectures
          </button>
        </div>
      </div>

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

      {/* History Items Grid */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <LoadingSpinner message="Retrieving your accessibility history..." size="lg" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <HistoryIcon className="w-12 h-12 text-slate-400 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            No items in history
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Use the Content Simplifier, Image Describer, or Lecture Notes tools to generate and save
            records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getFeatureIcon(item.featureType)}
                      </div>
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                        {item.featureType}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                    {item.outputData?.plainLanguage ||
                      item.outputData?.detailedDescription ||
                      item.outputData?.summary ||
                      'Accessible content stored.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-brand-700 dark:text-brand-300 font-bold text-xs transition-colors"
                    aria-label={`View full details of ${item.title}`}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleDelete(id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label={`Delete ${item.title} from history`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-brand-600">
                  {selectedItem.featureType} • {new Date(selectedItem.createdAt).toLocaleString()}
                </span>
                <h2 id="modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                aria-label="Close details modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Simplification Details */}
            {selectedItem.featureType === 'simplify' && selectedItem.outputData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    Plain-Language Summary
                  </span>
                  <TTSButton
                    text={selectedItem.outputData.plainLanguage}
                    language={selectedItem.language || 'English'}
                    label="Read"
                  />
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 whitespace-pre-line text-sm">
                  {selectedItem.outputData.plainLanguage}
                </div>

                {selectedItem.outputData.keyPoints && (
                  <div className="space-y-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">
                      Key Takeaways
                    </span>
                    <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {selectedItem.outputData.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Image Details */}
            {selectedItem.featureType === 'describe-image' && selectedItem.outputData && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="font-bold text-xs uppercase text-slate-500">Screen-reader Alt Text:</span>
                  <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl font-medium text-sm text-slate-900 dark:text-white">
                    "{selectedItem.outputData.altText}"
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-xs uppercase text-slate-500">Detailed Vision Description:</span>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {selectedItem.outputData.detailedDescription}
                  </div>
                </div>

                {selectedItem.outputData.detectedText && (
                  <div className="space-y-1">
                    <span className="font-bold text-xs uppercase text-slate-500">Detected Image Text:</span>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 font-mono text-xs text-slate-800 dark:text-slate-200">
                      {selectedItem.outputData.detectedText}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lecture Details */}
            {selectedItem.featureType === 'lecture-notes' && selectedItem.outputData && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm whitespace-pre-line text-slate-800 dark:text-slate-200">
                  {selectedItem.outputData.summary}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

