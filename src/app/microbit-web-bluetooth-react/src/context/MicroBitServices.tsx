import React, { useCallback, useEffect } from 'react';
import { BoundCallback } from '../statemachine/MachineContext';
import { ServicesEffector, useMicrobitActor } from './Microbit';
import { Services } from 'microbit-web-bluetooth';

interface Props {
    //children?: any;
    onServicesBound?: BoundCallback<Services>;
}

export function MicrobitServices(props: Props) {
    const [state] = useMicrobitActor();

    const cb = useCallback<BoundCallback<Services>>((bound) => {
        if (props.onServicesBound) {
            props.onServicesBound(bound);
        }
    }, []);
    useEffect(ServicesEffector(state, cb), []);

    return (
        <React.Fragment />
    );
}
