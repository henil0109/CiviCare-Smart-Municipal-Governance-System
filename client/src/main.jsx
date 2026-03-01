import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Set global API base URL
// In dev mode: empty string (Vite proxy handles /api/* → localhost:5000)
// In production: hardcoded Render backend URL
axios.defaults.baseURL = import.meta.env.DEV
    ? ''
    : 'https://civicare-smart-municipal-governance.onrender.com'

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
