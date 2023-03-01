import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
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
        <Microbit/>
      </header>
    </div>
  );
}

export default App;
