import React, { useCallback, useEffect } from 'react';
import { DeviceBoundCallback } from '../StateMachine/MachineContext';
import { DeviceEffector, useMicrobitActor } from './Microbit';

interface Props {
    //children?: any;
    onDeviceBound?: DeviceBoundCallback;
}

export function MicrobitDevice(props: Props) {
    const [state] = useMicrobitActor();

    const cb = useCallback<DeviceBoundCallback>((device, binding) => {
        if (props.onDeviceBound) {
            props.onDeviceBound(device, binding);
        }
    }, []);
    useEffect(DeviceEffector(state, cb), []);

    return (
        <React.Fragment />
    );
}
