import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import MicrobitContextProvider from './microbit-web-bluetooth-react';
import Microbit from './components/Microbit';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/*
        <Logo className="App-logo" />
        <p>
          Edit <code>src/app/App.tsx</code> and save to reload.
        </p>
        */}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <table>
          <tr>
            <td>
              <MicrobitContextProvider>
                <Microbit />
              </MicrobitContextProvider>
            </td>
            <td>
              <MicrobitContextProvider>
                <Microbit />
              </MicrobitContextProvider>
            </td>
          </tr>
        </table>
      </header>
    </div>
  );
}

export default App;
