import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import './index.css'
import { registerServiceWorker } from './utils/serviceWorker'
import { initializePaystack } from './utils/paystack'

// Initialize Paystack
initializePaystack();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for offline functionality
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  // Delay registration to avoid blocking initial render
  setTimeout(() => {
    registerServiceWorker().catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  }, 1000);
}
