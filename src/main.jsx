import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'; // Global styles

// Load theme preference from localStorage before rendering the app
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
} else {
  // Default to light theme
  document.body.classList.add('light-theme');
  localStorage.setItem('theme', 'light');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);