import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { crystalTheme } from './theme.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={crystalTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);