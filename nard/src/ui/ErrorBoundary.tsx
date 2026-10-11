import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <div className="mark" style={{ fontSize: 44 }}>تخته نرد</div>
          <p style={{ color: 'var(--ink-dim)' }}>مشکلی پیش آمد. بازی شما ذخیره شده است.</p>
          <button className="btn btn-gold" onClick={() => location.reload()}>
            بارگذاری دوباره
          </button>
        </div>
      </div>
    );
  }
}
