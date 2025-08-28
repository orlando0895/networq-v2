import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { subscriptionManager } from '@/lib/supabase-subscriptions';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Clean up all subscriptions when page unloads (helpful for StrictMode)
window.addEventListener('beforeunload', () => {
  console.log('🧹 Cleaning up all Supabase subscriptions...');
  subscriptionManager.cleanup();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
