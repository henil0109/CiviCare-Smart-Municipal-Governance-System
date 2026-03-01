import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Set global API base URL — in production this points to Render backend
// In dev, falls back to '' (relative), which is handled by Vite proxy
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

// GLOBAL ERROR TRAP: Displays errors if React fails to mount
window.onerror = function (message, source, lineno, colno, error) {
    const errorBox = document.createElement('div');
    errorBox.style.position = 'fixed';
    errorBox.style.top = '0';
    errorBox.style.left = '0';
    errorBox.style.width = '100%';
    errorBox.style.padding = '20px';
    errorBox.style.backgroundColor = '#fee2e2';
    errorBox.style.color = '#991b1b';
    errorBox.style.zIndex = '9999';
    errorBox.style.fontFamily = 'monospace';
    errorBox.style.whiteSpace = 'pre-wrap';
    errorBox.innerText = `CRITICAL ERROR:\n${message}\n\nSource: ${source}:${lineno}:${colno}\n\nStack:\n${error ? error.stack : 'No stack trace'}`;
    document.body.appendChild(errorBox);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
