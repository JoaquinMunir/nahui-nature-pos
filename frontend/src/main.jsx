import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// INICIO: Registro del Service Worker
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })
// FIN: Registro del Service Worker

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)