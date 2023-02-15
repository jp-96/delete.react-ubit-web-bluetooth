import React, { useEffect } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import { useMicroBit } from './hooks/MicrobitWebBluetooth';
import { useMicrobitBLE } from './hooks/MicrobitBLE';

function App() {
  const {state, request, connect, disconnect} = useMicrobitBLE(window.navigator.bluetooth);
  console.log('App/state: ', state)
  return (
    <div className="App">
      <header className="App-header">
        <Logo className="App-logo" />
        <p>
          Edit <code>src/app/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>
          <button onClick={() => request("TagA")}>Request</button>
          <button onClick={() => connect("TagA")}>Connect</button>
          <button onClick={() => disconnect("TagA")}>Disconnect</button>
        </p>
        <p>{JSON.stringify(state)}</p>
      </header>
    </div>
  );
}

export default App;
