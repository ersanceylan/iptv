import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StreamPulse Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('streampulse_player_height');
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-rose-500/30 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-xl font-black text-white">Bir Hata Oluştu / Something Went Wrong</h2>
            
            <p className="text-xs text-neutral-400">
              Oynatıcı veya sayfa bileşeni yüklenirken beklenmeyen bir hata meydana geldi:
            </p>

            <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
              {this.state.error?.toString() || 'Unknown Error'}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Ana Sayfa / Home</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Yeniden Yükle / Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
