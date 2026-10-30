import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  message = 'Processing content with AccessBridge AI...',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-6 space-y-3"
    >
      <Loader2
        className={`${sizeClasses[size] || sizeClasses.md} text-brand-600 animate-spin`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {message}
      </span>
      <span className="sr-only">Please wait, operation is underway</span>
    </div>
  );
}

