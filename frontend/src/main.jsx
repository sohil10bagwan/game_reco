import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#16213e',
          color: '#fff',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '12px',
          fontSize: '0.9rem',
        },
        success: { iconTheme: { primary: '#6c63ff', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>,
)
