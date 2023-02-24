import React, { useCallback, useEffect, useState } from 'react';
import { useMicrobitActor } from './StateMachineContext';

export default function MicroBitDeviceName() {
    const [state] = useMicrobitActor();
    const [device, setDevice] = useState<BluetoothDevice | undefined>(undefined);
    
    const cb = useCallback((device: BluetoothDevice, binding: boolean) => {   
        if (binding) {
            setDevice(device);
        } else {
            setDevice(undefined);
        }
    }, []);
    useEffect(() => {
        state.context.microbit.addDeviceCallback(cb);
        return () => {
            state.context.microbit.addDeviceCallback(cb);
        };
    }, []);

    return (
        <React.Fragment>
            {device?.name}
        </React.Fragment>
    );
}
