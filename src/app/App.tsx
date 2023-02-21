import React, { useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
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

  const listItems =  (() => {
    const serviceNames: string[] = [];
    const services = state.context.microbitServices;
    if (services) {
      Object.keys(services).forEach((key) => {
        if (services[key]) {
          serviceNames.push(key);
        }
      });
    }
    return serviceNames;
  })().map((serviceName) => <li>{serviceName}</li>);

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
          {"[" + state.toStrings() + "]"}<br/>
          <button onClick={() => send("RESET")}>RESET</button>
          <button onClick={() => send("REQUEST")}>REQUEST</button>
          <button onClick={() => send("CONNECT")}>Connect</button>
          <button onClick={() => send("DISCONNECT")}>Disconnect</button>
          <br/>
          {state.context.microbitDevice?.name && ("[" + state.context.microbitDevice.name + "]")}
          <br/>
          Button A: {`${buttonA}`} / Button B: {`${buttonB}`}
        </p>
        {listItems.length > 0 && <p>services:<ul>{listItems}</ul></p>}
        <p>
          {state.context.rejectedReason && ("rejected: " + state.context.rejectedReason)}<br/>
          {state.context.disconnectedReason && ( "disconnected: " + state.context.disconnectedReason)}
        </p>
      </header>
    </div>
  );
}

export default App;
