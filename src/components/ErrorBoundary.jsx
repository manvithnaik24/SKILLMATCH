import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🔴 App Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#F8F9FB', fontFamily: 'Inter, sans-serif', padding: '2rem'
        }}>
          <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
            padding: '2.5rem', maxWidth: '560px', width: '100%', textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '2rem'
            }}>⚠️</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <pre style={{
              background: '#f8f9fa', border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '1rem', fontSize: '0.75rem', color: '#ef4444', textAlign: 'left',
              overflowX: 'auto', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto'
            }}>
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#2E8B57', color: 'white', border: 'none',
                borderRadius: '12px', padding: '0.75rem 1.5rem',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer'
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
