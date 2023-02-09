import React, { useEffect } from 'react';
import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import { useMicroBit } from './hooks/MicrobitWebBluetooth';

function App() {
  const {device, services, onClick} = useMicroBit(window.navigator.bluetooth);

  console.log(device);

  function eventHandler(event) {
    console.log(`${event.type}: ${JSON.stringify(event.detail, null, 2)}`);
  }

  useEffect(()=>{
    if (services && services.buttonService) {
      services.buttonService.addEventListener("buttonastatechanged", eventHandler);
      services.buttonService.addEventListener("buttonbstatechanged", eventHandler);
      console.log('buttonService!');
    }
  }, [services]);

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
          <button onClick={onClick}>device</button>
        </p>
        <p>{device?.name}</p>
      </header>
    </div>
  );
}

export default App;
