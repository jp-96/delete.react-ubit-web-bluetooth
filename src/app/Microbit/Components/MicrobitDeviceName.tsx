import React, { useCallback, useEffect, useState } from 'react';
import { DeviceCallback } from '../MachineContext';
import { DeviceEffector, useMicrobitActor } from '../MachineReact';

export default function MicroBitDeviceName() {
    const [state] = useMicrobitActor();
    const [device, setDevice] = useState<BluetoothDevice | undefined>(undefined);
    
    const cb = useCallback<DeviceCallback>((device, binding) => {   
        if (binding) {
            setDevice(device);
        } else {
            setDevice(undefined);
        }
    }, []);
    useEffect(DeviceEffector(state, cb),[]);

    return (
        <React.Fragment>
            {device?.name} ({device?.id})
        </React.Fragment>
    );
}
