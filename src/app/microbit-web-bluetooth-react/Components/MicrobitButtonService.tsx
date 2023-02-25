import React, { useCallback, useEffect, useState } from 'react';
import { ServiceProps, ServicesEffector, useMicrobitActor } from './Microbit';
import { ServicesBoundCallback } from '../StateMachine/MachineContext';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';

export type ButtonStateChangedCallback = (event: CustomEvent<ButtonState>) => void;

interface Props extends ServiceProps<ButtonService> {
    onButtonAStateChanged?: ButtonStateChangedCallback;
    onButtonBStateChanged?: ButtonStateChangedCallback;
}

export function MicrobitButtonService(props: Props) {
    const [state] = useMicrobitActor();
    
    const cb = useCallback<ServicesBoundCallback>((services, binding) => {
        const buttonService = services.buttonService;
        if (buttonService){
            if (binding) {
                // button A
                if (props.onButtonAStateChanged) {
                    buttonService.addEventListener('buttonastatechanged', props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    buttonService.addEventListener('buttonbstatechanged', props.onButtonBStateChanged)
                }
            } else {
                // button A
                if (props.onButtonAStateChanged) {
                    buttonService.removeEventListener('buttonastatechanged', props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    buttonService.removeEventListener('buttonbstatechanged', props.onButtonBStateChanged)
                }
            }
            if (props.onServiceBound) {
                props.onServiceBound(buttonService, binding);
            }
        }
        
    }, []);
    useEffect(ServicesEffector(state, cb), []);

    return (
        <React.Fragment>
            {props.children}
        </React.Fragment>
    );
}
