import React from 'react'
import {requestMicrobit, getServices, Services} from 'microbit-web-bluetooth';

function useMicroBit(bluetooth: Bluetooth) {
  const [device, setDevice] = React.useState<BluetoothDevice | undefined>(undefined);
  const [services, setServices] = React.useState<Services | undefined>(undefined);

  const onClick = React.useCallback(() => {
    async function getDevice() {
      const device = await requestMicrobit(bluetooth);
      setDevice(device);
      if (device) {
        const services = await getServices(device);
        setServices(services);
      } else {
        setServices(undefined);
      }
    }
    getDevice();
  }, []);

  return { services, device, onClick, };
}

export { useMicroBit, }
