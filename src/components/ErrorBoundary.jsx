import { Component } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Studio Error Boundary caught an exception:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#040407] text-white flex flex-col items-center justify-center p-8 z-50 font-['Outfit']">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/10 p-8 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            
            <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">
              Studio Recovered
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              An unexpected engine exception occurred. Your workspace data is safe in local storage.
            </p>
            
            <button
              onClick={this.handleReload}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_20px_rgba(99,102,241,0.4)] active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Reset Studio Context
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
