import React from 'react';
import { ServiceProps } from '../context/Microbit';
import { ServicesBoundCallback } from '../statemachine/MachineContext';
import { MicrobitServices } from '../context/MicroBitServices';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';

export type ButtonStateChangedCallback = (event: CustomEvent<ButtonState>) => void;

interface Props extends ServiceProps<ButtonService> {
    onButtonAStateChanged?: ButtonStateChangedCallback;
    onButtonBStateChanged?: ButtonStateChangedCallback;
}

const buttonastatechanged = 'buttonastatechanged';
const buttonbstatechanged = 'buttonbstatechanged';

export function MicrobitButtonService(props: Props) {

    const cb: ServicesBoundCallback = (bound) => {
        const buttonService = bound.target.buttonService;
        if (buttonService) {
            if (bound.binding) {
                // button A
                if (props.onButtonAStateChanged) {
                    buttonService.addEventListener(buttonastatechanged, props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    buttonService.addEventListener(buttonbstatechanged, props.onButtonBStateChanged)
                }
            } else {
                // button A
                if (props.onButtonAStateChanged) {
                    buttonService.removeEventListener(buttonastatechanged, props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    buttonService.removeEventListener(buttonbstatechanged, props.onButtonBStateChanged)
                }
            }
            if (props.onServiceBound) {
                props.onServiceBound({ target: buttonService, binding: bound.binding });
            }
        }

    }

    return (
        <MicrobitServices onServicesBound={cb} />
    );
}
