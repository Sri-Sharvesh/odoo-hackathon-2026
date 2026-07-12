import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './ErrorState'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render-time exceptions so one broken screen never blanks the whole app.
 * Wrap route content with this; it recovers via the retry button in the fallback.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO(observability): forward to an error tracker (e.g. Sentry) once configured.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private readonly handleReset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-8">
            <ErrorState onRetry={this.handleReset} />
          </div>
        )
      )
    }
    return this.props.children
  }
}
