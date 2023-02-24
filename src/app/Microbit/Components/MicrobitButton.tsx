import React, { useCallback, useEffect, useState } from 'react';
import { ServicesEffector, useMicrobitActor } from './Microbit';
import { ServicesCallback } from '../MachineContext';

type ButtonA = 'a';
type ButtonB = 'b';
type ButtonType = ButtonA | ButtonB;

type Props = {
    button: ButtonType;
}

export default function MicroBitButton( props: Props ) {
    const [state] = useMicrobitActor();
    const [button, setButton] = useState(0);
    
    const cb = useCallback<ServicesCallback>((services, binding) => {        
        const listenerButton = (event: CustomEvent<any>) => {
            console.log("Button:", `${event.type}`, `${event.detail}`);
            setButton(event.detail);
        };
        const eventType = props.button === 'a' ? 'buttonastatechanged' : 'buttonbstatechanged';
        if (binding) {
            services.buttonService?.addEventListener(eventType, listenerButton);
        } else {
            services.buttonService?.removeEventListener(eventType, listenerButton);
        }
    }, []);
    useEffect(ServicesEffector(state, cb), []);

    return (
        <React.Fragment>
            {button}
        </React.Fragment>
    );
}
