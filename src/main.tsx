import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW falhou: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
