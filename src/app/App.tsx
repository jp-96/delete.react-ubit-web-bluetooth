import React, { useCallback, useEffect, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import { Services } from 'microbit-web-bluetooth';
import { useMicrobitActor } from './Microbit/MachineReact';
import MicroBitDeviceName from './Microbit/Components/MicrobitDeviceName';
import MicroBitButton from './Microbit/Components/MicrobitButton';

function App() {
  const [state, send] = useMicrobitActor();
  const [services, setServices] = useState<Services>({});
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
  
  const cb = useCallback((services, binding) => {
    if (binding) {
      services.buttonService?.addEventListener("buttonastatechanged", listenerButtonA);
      services.buttonService?.addEventListener("buttonbstatechanged", listenerButtonB);
      setServices(services);
    } else {
      setServices({});
      //services.buttonService?.removeAllListeners("buttonastatechanged");
      //services.buttonService?.removeAllListeners("buttonbstatechanged");
    }
  }, []);

  useEffect(() => {
    state.context.microbit.addServicesCallback(cb);
    return () => {
        state.context.microbit.removeServicesCallback(cb);
    };
  }, []);

  const listItems =  (() => {
    const serviceNames: string[] = [];
    if (services) {
      Object.keys(services).forEach((key) => {
        if (services[key]) {
          serviceNames.push(key);
        }
      });
    }
    return serviceNames;
  })().map((serviceName) => <li key={serviceName}>{serviceName}</li>);

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
          <MicroBitDeviceName/>
          <br/>
          Button A: {`${buttonA}`} / Button B: {`${buttonB}`}
          <br/>
          Button a: <MicroBitButton button='a' /> / Button b: <MicroBitButton button='b' />
        </p>
        {listItems.length > 0 && <div>services:<ul>{listItems}</ul></div>}
        <p>
          {state.context.rejectedReason && ("rejected: " + state.context.rejectedReason)}<br/>
          {state.context.disconnectedReason && ( "disconnected: " + state.context.disconnectedReason)}
        </p>
      </header>
    </div>
  );
}

export default App;
