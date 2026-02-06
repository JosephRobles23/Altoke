'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">Algo salió mal</h2>
          <p className="mb-4 text-muted-foreground">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
          >
            Intentar de nuevo
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
