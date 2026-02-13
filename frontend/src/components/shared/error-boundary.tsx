import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    console.log('[ErrorBoundary] Resetting error state');
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-center max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <pre className="max-w-lg rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={this.handleReset}>
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
