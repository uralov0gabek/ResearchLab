import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './i18n';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
      <h2>Critical Rendering Error</h2>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    </div>`;
  }
  console.error("Critical rendering error:", error);
}
