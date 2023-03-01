import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//import './index.css'; // ==> ../index.html
import App from './App';

const root = createRoot(document.getElementById('root') as Element);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
