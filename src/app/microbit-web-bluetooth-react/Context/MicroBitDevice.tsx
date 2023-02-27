import React, { useCallback, useEffect } from 'react';
import { DeviceBoundCallback } from '../StateMachine/MachineContext';
import { DeviceEffector, useMicrobitActor } from './Microbit';

interface Props {
    //children?: any;
    onDeviceBound?: DeviceBoundCallback;
}

export function MicrobitDevice(props: Props) {
    const [state] = useMicrobitActor();

    const cb = useCallback<DeviceBoundCallback>((bound) => {
        if (props.onDeviceBound) {
            props.onDeviceBound(bound);
        }
    }, []);
    useEffect(DeviceEffector(state, cb), []);

    return (
        <React.Fragment />
    );
}
