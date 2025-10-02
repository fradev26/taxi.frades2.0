import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TriangleAlert as AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  isAdmin?: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} isAdmin={this.props.isAdmin} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError, isAdmin }: { error?: Error; resetError: () => void; isAdmin?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Er is iets misgegaan</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isAdmin && error?.message ? error.message : 'Er is een onverwachte fout opgetreden.'}
          </p>
          {isAdmin && error?.stack && (
            <details className="text-left text-xs bg-muted p-3 rounded-md mt-4">
              <summary className="cursor-pointer font-semibold mb-2">Technische details (alleen voor admins)</summary>
              <pre className="whitespace-pre-wrap overflow-auto max-h-40">{error.stack}</pre>
            </details>
          )}
          <Button onClick={resetError} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Probeer opnieuw
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component to pass isAdmin prop
export function ErrorBoundaryWithAuth({ children, fallback }: ErrorBoundaryProps) {
  const { isAdmin } = useAuth();
  return (
    <ErrorBoundary isAdmin={isAdmin} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}