import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Buffer } from 'buffer'

// Add Buffer polyfill at the top of the file
window.Buffer = Buffer

// Add error handling for React rendering
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Add unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  console.log('Root element found, rendering app...');
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Error rendering app:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">
    <h1>Error Loading Application</h1>
    <p>${error.message}</p>
    <pre>${error.stack}</pre>
  </div>`;
}
