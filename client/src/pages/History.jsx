import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Eye,
  FileText,
  Headphones,
  AlertTriangle,
  Loader2,
  X,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import ResultCard from '../components/ResultCard';
import api from '../services/api';

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/history');
      if (res.data.success) {
        setHistoryList(res.data.history || []);
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

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/history/${id}`);
      setHistoryList((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (selectedItem && (selectedItem._id || selectedItem.id) === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      setError('Failed to delete item from history.');
    }
  };

  const filteredItems = historyList.filter((item) => {
    if (filterType === 'all') return true;
    return item.featureType === filterType;
  });

  const getFeatureIcon = (type) => {
    switch (type) {
      case 'simplify':
        return <FileText size={18} className="text-brand-700" aria-hidden="true" />;
      case 'describe-image':
        return <Eye size={18} className="text-brand-700" aria-hidden="true" />;
      case 'lecture-notes':
        return <Headphones size={18} className="text-brand-700" aria-hidden="true" />;
      default:
        return <HistoryIcon size={18} className="text-muted" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ink">Accessibility History</h2>
          <p className="mt-1 text-muted text-sm sm:text-base">
            Review, re-read, and manage your past AI simplifications, image descriptions, and lecture notes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter history items"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-line bg-card"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filterType === 'all'}
            onClick={() => setFilterType('all')}
            className={`btn-ghost !min-h-[38px] !px-3 text-xs font-semibold ${
              filterType === 'all'
                ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold'
                : 'text-muted hover:text-ink'
            }`}
          >
            All ({historyList.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterType === 'simplify'}
            onClick={() => setFilterType('simplify')}
            className={`btn-ghost !min-h-[38px] !px-3 text-xs font-semibold ${
              filterType === 'simplify'
                ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold'
                : 'text-muted hover:text-ink'
            }`}
          >
            Simplifications
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterType === 'describe-image'}
            onClick={() => setFilterType('describe-image')}
            className={`btn-ghost !min-h-[38px] !px-3 text-xs font-semibold ${
              filterType === 'describe-image'
                ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold'
                : 'text-muted hover:text-ink'
            }`}
          >
            Images
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterType === 'lecture-notes'}
            onClick={() => setFilterType('lecture-notes')}
            className={`btn-ghost !min-h-[38px] !px-3 text-xs font-semibold ${
              filterType === 'lecture-notes'
                ? 'bg-brand-100 text-brand-700 border-brand-600 font-bold'
                : 'text-muted hover:text-ink'
            }`}
          >
            Lectures
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900"
        >
          <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={20} aria-hidden="true" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="card text-center p-12 flex flex-col items-center justify-center gap-3 text-muted">
          <Loader2 className="animate-spin text-brand-700" size={32} aria-hidden="true" />
          <span className="text-sm font-medium">Retrieving your accessibility history...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center p-12 space-y-3">
          <HistoryIcon size={40} className="mx-auto text-muted" aria-hidden="true" />
          <h3 className="text-lg font-bold text-ink">No items found</h3>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Use the Content Simplifier, Image Describer, or Lecture Notes tools to generate records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className="card hover:border-brand-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 border border-brand-100">
                        {getFeatureIcon(item.featureType)}
                      </span>
                      <span className="text-xs font-bold uppercase text-muted tracking-wider">
                        {item.featureType}
                      </span>
                    </div>

                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar size={13} aria-hidden="true" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-ink line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                    {item.outputData?.plainLanguage ||
                      item.outputData?.plainVersion ||
                      item.outputData?.detailedDescription ||
                      item.outputData?.summary ||
                      'Accessible content stored.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="btn-ghost !min-h-[40px] text-xs font-semibold text-brand-700 hover:bg-brand-50 flex items-center gap-1.5"
                    aria-label={`View full details of ${item.title}`}
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(id, e)}
                    className="btn-ghost !min-h-[40px] !px-2.5 text-muted hover:text-rose-600 hover:bg-rose-50"
                    aria-label={`Delete ${item.title} from history`}
                    title="Delete item"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Detail Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="card max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-brand-700">
                  {selectedItem.featureType} • {new Date(selectedItem.createdAt).toLocaleString()}
                </span>
                <h3 id="modal-title" className="text-xl font-extrabold text-ink">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-ghost !min-h-[40px] !px-2.5 text-muted hover:text-ink"
                aria-label="Close details modal"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Simplification Details */}
            {selectedItem.featureType === 'simplify' && selectedItem.outputData && (
              <div className="space-y-4">
                <ResultCard
                  title="Plain-Language Summary"
                  text={selectedItem.outputData.plainLanguage || selectedItem.outputData.plainVersion}
                  lang={selectedItem.language || 'English'}
                />

                {selectedItem.outputData.keyPoints?.length > 0 && (
                  <ResultCard title="Key Takeaways" lang={selectedItem.language || 'English'}>
                    <ul className="space-y-2 mt-2 list-none pl-0">
                      {selectedItem.outputData.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-ink bg-surface p-3 rounded-xl border border-line">
                          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}
              </div>
            )}

            {/* Image Details */}
            {selectedItem.featureType === 'describe-image' && selectedItem.outputData && (
              <div className="space-y-4">
                {selectedItem.outputData.altText && (
                  <ResultCard
                    title="Screen-Reader Alt Text"
                    text={selectedItem.outputData.altText}
                    lang={selectedItem.language || 'English'}
                  />
                )}

                {selectedItem.outputData.detailedDescription && (
                  <ResultCard
                    title="Detailed Scene Description"
                    text={selectedItem.outputData.detailedDescription}
                    lang={selectedItem.language || 'English'}
                  />
                )}

                {selectedItem.outputData.detectedText && (
                  <ResultCard
                    title="Detected Text (OCR)"
                    text={selectedItem.outputData.detectedText}
                    lang={selectedItem.language || 'English'}
                  />
                )}
              </div>
            )}

            {/* Lecture Details */}
            {selectedItem.featureType === 'lecture-notes' && selectedItem.outputData && (
              <div className="space-y-4">
                <ResultCard
                  title={selectedItem.outputData.title || 'Lecture Summary'}
                  text={selectedItem.outputData.summary}
                  lang={selectedItem.language || 'English'}
                />
              </div>
            )}

            <div className="pt-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-ghost !min-h-[44px] text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
