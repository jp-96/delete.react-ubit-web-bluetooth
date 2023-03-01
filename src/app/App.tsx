import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import {
  CustomEventCallback,
  BoundCallback,
  MicrobitAccelerometer,
  ServicesEffector,
  useMicrobitActor
} from './microbit-web-bluetooth-react';
import MicroBitInfo from './components/MicrobitInfo';
import MicrobitButtonState from './components/MicrobitButtonState';
import { Services } from 'microbit-web-bluetooth';
import { AccelerometerData, AccelerometerPeriod } from 'microbit-web-bluetooth/types/services/accelerometer';
import MicrobitTemperatureView from './components/MicrobitTemperatureView';

function App() {
  const [state, send] = useMicrobitActor();
  const [stateA, setStateA] = useState("");
  const [stateB, setStateB] = useState("");
  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0, });
  const [services, setServices] = useState<Services>({});
  const [frequency, setFrequency] = useState<AccelerometerPeriod>(20);

  const cb = useCallback<BoundCallback<Services>>((bound) => {

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

    if (bound.binding) {
      bound.target.buttonService?.addEventListener("buttonastatechanged", listenerButtonA);
      bound.target.buttonService?.addEventListener("buttonbstatechanged", listenerButtonB);
      setServices({ ...bound.target });
    } else {
      bound.target.buttonService?.removeEventListener("buttonastatechanged", listenerButtonA);
      bound.target.buttonService?.removeEventListener("buttonbstatechanged", listenerButtonB);
      setServices({});
    }
  }, []);

  useEffect(ServicesEffector(state, cb), []);

  const cbAcc: CustomEventCallback<AccelerometerData> = (event) => {
    setAcc({ x: event.detail.x, y: event.detail.y, z: event.detail.z })
  }

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
          {state.context.conn.name + ": [" + state.toStrings() + "]"}<br />
          <button onClick={() => send("RESET")}>RESET</button>
          <button onClick={() => send("REQUEST")}>REQUEST</button>
          <button onClick={() => send("CONNECT")}>CONNECT</button>
          <button onClick={() => send("DISCONNECT")}>DISCONNECT</button>
          <br />
          name: <MicroBitInfo infoName="name" />
          <br />
          id: <MicroBitInfo infoName="id" />
          <br />
          Button A: <MicrobitButtonState button='a' /> {stateA}
          <br />
          Button B: <MicrobitButtonState button='b' /> {stateB}
          <br />
          <MicrobitAccelerometer onAccelerometerDataChanged={cbAcc} accelerometerPeriod={frequency} />
          <br />
          x: {acc.x}, y: {acc.y}, z: {acc.z}
          <br />
          <button onClick={() => setFrequency(640)}>SLOW</button>
          {`${frequency}`}
          <button onClick={() => setFrequency(20)}>FAST</button><br/>
          TEMP: <MicrobitTemperatureView />
        </p>
        {listItems.length > 0 && <div>services:<ul>{listItems}</ul></div>}
        <p>
          {state.context.rejectedReason.type !== "NONE" && ("rejected: " + state.context.rejectedReason.message)}<br />
          {state.context.disconnectedReason.type !== "NONE" && ("disconnected: " + state.context.disconnectedReason.message)}
        </p>
      </header>
    </div>
  );
}

export default App;
