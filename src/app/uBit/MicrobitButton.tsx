import React, { useCallback, useEffect, useState } from 'react';
import { Services } from 'microbit-web-bluetooth';
import { useMicrobitActor } from './StateMachineContext';

type ButtonA = 'a';
type ButtonB = 'b';
type ButtonType = ButtonA | ButtonB;

type Props = {
    button: ButtonType;
}

export default function MicroBitButton( props: Props ) {
    const [state] = useMicrobitActor();
    const [button, setButton] = useState(0);
    
    const cb = useCallback((services: Services, binding: boolean) => {        
        const listenerButton = (event: any) => {
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
    
    useEffect(() => {
        state.context.microbit.addServicesCallback(cb);
        return () => {
            state.context.microbit.removeServicesCallback(cb);
        };
    }, []);

    return (
        <React.Fragment>
            {button}
        </React.Fragment>
    );
}
