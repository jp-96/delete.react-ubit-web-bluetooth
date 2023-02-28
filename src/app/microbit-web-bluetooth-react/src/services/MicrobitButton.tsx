import React from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<ButtonService> {
    onButtonAStateChanged?: CustomEventCallback<ButtonState>;
    onButtonBStateChanged?: CustomEventCallback<ButtonState>;
}

const buttonastatechanged = 'buttonastatechanged';
const buttonbstatechanged = 'buttonbstatechanged';

export function MicrobitButton(props: Props) {

    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.buttonService;
        if (target) {
            if (bound.binding) {
                // button A
                if (props.onButtonAStateChanged) {
                    target.addEventListener(buttonastatechanged, props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    target.addEventListener(buttonbstatechanged, props.onButtonBStateChanged)
                }
            } else {
                // button A
                if (props.onButtonAStateChanged) {
                    target.removeEventListener(buttonastatechanged, props.onButtonAStateChanged)
                }
                // button B
                if (props.onButtonBStateChanged) {
                    target.removeEventListener(buttonbstatechanged, props.onButtonBStateChanged)
                }
            }
            if (props.onServiceBound) {
                props.onServiceBound({ ...bound, target });
            }
        }
    };

    return (
        <MicrobitServices onServicesBound={onServicesBound} />
    );
}
