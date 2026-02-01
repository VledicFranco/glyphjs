import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import type { Diagnostic } from '@glyphjs/types';

// ─── Props & State ────────────────────────────────────────────

interface ErrorBoundaryProps {
  blockId: string;
  blockType: string;
  onDiagnostic: (diagnostic: Diagnostic) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Error Boundary ───────────────────────────────────────────

/**
 * Per-block error boundary that catches render errors.
 * Reports diagnostics via the onDiagnostic callback and renders
 * a fallback UI instead of crashing the entire document.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const { blockId, blockType, onDiagnostic } = this.props;

    onDiagnostic({
      severity: 'error',
      code: 'RUNTIME_RENDER_ERROR',
      message: `Error rendering block "${blockId}" (type: ${blockType}): ${error.message}`,
      source: 'runtime',
      details: {
        blockId,
        blockType,
        errorMessage: error.message,
        componentStack: info.componentStack,
      },
    });
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const { blockId, blockType } = this.props;
      const { error } = this.state;

      return (
        <div
          style={{
            border: '1px solid #e53e3e',
            borderRadius: '4px',
            padding: '8px 12px',
            margin: '4px 0',
            backgroundColor: '#fff5f5',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ color: '#e53e3e', fontWeight: 600 }}>
            Render error in block &quot;{blockId}&quot; ({blockType})
          </div>
          {error && (
            <div style={{ color: '#742a2a', marginTop: '4px' }}>
              {error.message}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
