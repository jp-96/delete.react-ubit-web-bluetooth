import React, { useCallback, useEffect } from 'react';
import { ServicesBoundCallback } from '../statemachine/MachineContext';
import { ServicesEffector, useMicrobitActor } from './Microbit';

interface Props {
    //children?: any;
    onServicesBound?: ServicesBoundCallback;
}

export function MicrobitServices(props: Props) {
    const [state] = useMicrobitActor();

    const cb = useCallback<ServicesBoundCallback>((bound) => {
        if (props.onServicesBound) {
            props.onServicesBound(bound);
        }
    }, []);
    useEffect(ServicesEffector(state, cb), []);

    return (
        <React.Fragment />
    );
}
