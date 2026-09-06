import React, { type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.handleReset = this.handleReset.bind(this);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GoalBangla Uncaught UI Error]:', error, errorInfo);
  }

  private handleReset() {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div id="error-boundary-container" className="min-h-[400px] flex items-center justify-center p-6 my-8">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 font-display">
              কিছু সমস্যা হয়েছে / Something Went Wrong
            </h2>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              পৃষ্ঠাটি লোড করার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন অথবা হোমপেজে ফিরে যান।
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg text-xs font-mono text-neutral-500 text-left overflow-x-auto border border-neutral-200 dark:border-neutral-800">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                id="btn-error-retry"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
              
              <button
                id="btn-error-home"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>হোমপেজ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
