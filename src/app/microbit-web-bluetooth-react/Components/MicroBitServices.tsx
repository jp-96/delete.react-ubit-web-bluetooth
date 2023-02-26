import React, { useCallback, useEffect } from 'react';
import { ServicesBoundCallback } from '../StateMachine/MachineContext';
import { ServicesEffector, useMicrobitActor } from './Microbit';

interface Props {
    //children?: any;
    onServicesBound?: ServicesBoundCallback;
}

export function MicrobitServices(props: Props) {
    const [state] = useMicrobitActor();

    const cb = useCallback<ServicesBoundCallback>((services, binding) => {
        if (props.onServicesBound) {
            props.onServicesBound(services, binding);
        }
    }, []);
    useEffect(ServicesEffector(state, cb), []);

    return (
        <React.Fragment />
    );
}
