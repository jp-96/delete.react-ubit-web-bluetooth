import React, { useEffect } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import { useMicrobitBLE } from './hooks/MicrobitBLE';
import { Services } from 'microbit-web-bluetooth';

function App() {
  const bindServices = (services: Services, bind: Boolean) => {
    console.log("bind:", bind, services);
  };
  const {state, request, connect, disconnect} = useMicrobitBLE(window.navigator.bluetooth, bindServices);
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
        <p>{state.device.stateInfo}</p>
      </header>
    </div>
  );
}

export default App;
