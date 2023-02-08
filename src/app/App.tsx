import Logo from './Logo';  // logo.svg ==> Log0.tsx
//import './App.css'; // ==> ../index.html
import {requestMicrobit, getServices} from 'microbit-web-bluetooth';

function App() {

  function clickHandler() {

    function eventHandler(event) {
      console.log(`${event.type}: ${JSON.stringify(event.detail, null, 2)}`);
    }

    const connectDevice = async () => {
      //const device = await microbit.requestMicrobit(window.navigator.bluetooth);
      const device = await requestMicrobit(window.navigator.bluetooth);
      //const services = await microbit.getServices(device);
      if (device) {
        const services = await getServices(device);
        console.log(services); 
        if (services.buttonService) {
          services.buttonService.addEventListener("buttonastatechanged", eventHandler);
          services.buttonService.addEventListener("buttonbstatechanged", eventHandler);
          console.log('buttonService!');
        }
      }
    };
    connectDevice();
  }

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
          <button onClick={clickHandler}>device</button>
        </p>
      </header>
    </div>
  );
}

export default App;
