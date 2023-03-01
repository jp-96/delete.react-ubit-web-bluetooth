import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//import './index.css'; // ==> ../index.html
import MicrobitContextProvider from './microbit-web-bluetooth-react';
import App from './App';

const root = createRoot(document.getElementById('root') as Element);
root.render(
  <StrictMode>
    <MicrobitContextProvider connectionName='Top Level uBit'>
      <MicrobitContextProvider connectionName='2nd Level uBit'>
        <App />
      </MicrobitContextProvider>
    </MicrobitContextProvider>
  </StrictMode>
);
