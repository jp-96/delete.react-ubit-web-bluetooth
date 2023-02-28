import React from 'react';
import { CustomEventCallback, ServiceProps } from '../context/Microbit';
import { BoundCallback } from '../statemachine/MachineContext';
import { MicrobitServices } from '../context/MicroBitServices';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<ButtonService> {
    onButtonAStateChanged?: CustomEventCallback<ButtonState>;
    onButtonBStateChanged?: CustomEventCallback<ButtonState>;
}

const buttonastatechanged = 'buttonastatechanged';
const buttonbstatechanged = 'buttonbstatechanged';

export function MicrobitButtonService(props: Props) {

    const cb: BoundCallback<Services> = (bound) => {
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
