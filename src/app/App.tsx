import React, { useCallback, useEffect, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import {
  Services,
  ServicesEffector,
  useMicrobitActor
} from './microbit-web-bluetooth-react';
import MicroBitDevice from './Components/MicrobitDevice';
import MicroBitButton from './Components/MicrobitButton';

function App() {
  const [state, send] = useMicrobitActor();
  const [stateA, setStateA] = useState("");
  const [stateB, setStateB] = useState("");
  const [services, setServices] = useState<Services>({});

  const cb = useCallback((services, binding) => {

    const listenerButtonA = (event: any) => {
      console.log("Button A:", `${event.type}`, `${event.detail}`);
      if (event.detail === 2) {
        setStateA("(Long Press A)");
      } else {
        setStateA("")
      }
    };

    const listenerButtonB = (event: any) => {
      console.log("Button B:", `${event.type}`, `${event.detail}`);
      if (event.detail === 2) {
        setStateB("(Long Press B)");
      } else {
        setStateB("")
      }
    };

    if (binding) {
      services.buttonService?.addEventListener("buttonastatechanged", listenerButtonA);
      services.buttonService?.addEventListener("buttonbstatechanged", listenerButtonB);
      setServices(services);
    } else {
      services.buttonService?.removeEventListener("buttonastatechanged", listenerButtonA);
      services.buttonService?.removeEventListener("buttonbstatechanged", listenerButtonB);
      setServices({});
    }
  }, []);

  useEffect(ServicesEffector(state, cb), []);

  const listItems = (() => {
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
          {"[" + state.toStrings() + "]"}<br />
          <button onClick={() => send("RESET")}>RESET</button>
          <button onClick={() => send("REQUEST")}>REQUEST</button>
          <button onClick={() => send("CONNECT")}>CONNECT</button>
          <button onClick={() => send("DISCONNECT")}>DISCONNECT</button>
          <br />
          name: <MicroBitDevice display="name" />
          <br />
          id: <MicroBitDevice display="id" />
          <br />
          Button A: <MicroBitButton watching='a' /> {stateA}
          <br />
          Button B: <MicroBitButton watching='b' /> {stateB}
        </p>
        {listItems.length > 0 && <div>services:<ul>{listItems}</ul></div>}
        <p>
          {state.context.rejectedReason && ("rejected: " + state.context.rejectedReason)}<br />
          {state.context.disconnectedReason && ("disconnected: " + state.context.disconnectedReason)}
        </p>
      </header>
    </div>
  );
}

export default App;
