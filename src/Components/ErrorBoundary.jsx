import React from 'react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service (optional)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error, errorInfo) {
    try {
      fetch(import.meta.env.VITE_DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **Error Boundary Triggered**\n\`\`\`${error.toString()}\`\`\`\n${errorInfo.componentStack.slice(0, 500)}`
        })
      }).catch(() => {});
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <img src="https://img.icons8.com/3d-fluency/94/error.png" className="w-12 h-12" alt="Error" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-zinc-400 max-w-md mb-8">
            The application encountered an unexpected error. We've logged this issue and are working to fix it.
          </p>
          
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 max-w-2xl w-full overflow-auto text-left mb-8 max-h-64">
            <p className="text-red-400 font-mono text-sm mb-2">{this.state.error?.toString()}</p>
            <pre className="text-zinc-500 text-xs font-mono whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-violet-600 hover:bg-violet-700"
            >
              Reload Application
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
