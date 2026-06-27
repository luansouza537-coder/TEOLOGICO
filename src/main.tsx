import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface EBState { error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  handleReset() {
    localStorage.removeItem('religion_simulator_state_v2');
    window.location.reload();
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0e0b04', color: '#cfb53b', fontFamily: 'monospace', padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>⚠ Erro ao carregar CREDO</div>
          <div style={{ fontSize: '0.75rem', color: '#dfcfa0', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
            {this.state.error.message}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#dfcfa0aa', maxWidth: '400px', textAlign: 'center' }}>
            Isso pode ser causado por um save incompatível com a versão atual do jogo.
          </div>
          <button
            onClick={() => this.handleReset()}
            style={{ marginTop: '1rem', background: '#cfb53b', color: '#1e1a0c', border: 'none', padding: '0.75rem 1.5rem', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.875rem', cursor: 'pointer', borderRadius: '4px' }}
          >
            Limpar dados e reiniciar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
