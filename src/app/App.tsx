import React, { useEffect, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
//import { useMicrobitBLE } from './hooks/MicrobitBLE';
import { Services } from 'microbit-web-bluetooth';
import { useBindServicesCallback, useContextActor } from './StateMachine/MicrobitBluetoothMachineContext';

function App() {
  
  const [buttonA, setButtonA] = useState(0);
  const [buttonB, setButtonB] = useState(0);

  const listenerButtonA = (event: any) => {
    console.log("Button A:", `${event.type}`, `${event.detail}`);
    setButtonA(event.detail);
  };

  const listenerButtonB = (event: any) => {
    console.log("Button B:", `${event.type}`, `${event.detail}`);
    setButtonB(event.detail);
  };
  useBindServicesCallback((services, binding) => {
    if (binding) {
      services.buttonService?.addEventListener("buttonastatechanged", listenerButtonA);
      services.buttonService?.addEventListener("buttonbstatechanged", listenerButtonB);
    } else {
      //services.buttonService?.removeAllListeners("buttonastatechanged");
      //services.buttonService?.removeAllListeners("buttonbstatechanged");
    }
  });

  const [state, send] = useContextActor();

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
          <button onClick={() => send("RESET")}>RESET</button>
          <button onClick={() => send("REQUEST")}>REQUEST</button>
          <button onClick={() => send("CONNECT")}>Connect</button>
          <button onClick={() => send("DISCONNECT")}>Disconnect</button>
        </p>
        <p>{state.toStrings()}</p>
        <p>
          Button A: {`${buttonA}`}<br/>
          Button B: {`${buttonB}`}
        </p>
      </header>
    </div>
  );
}

export default App;
