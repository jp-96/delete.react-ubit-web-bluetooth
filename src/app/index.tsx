import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//import './index.css'; // ==> ../index.html
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
