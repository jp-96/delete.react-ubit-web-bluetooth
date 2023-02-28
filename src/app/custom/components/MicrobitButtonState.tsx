import React, { useState } from 'react';
import { MicrobitButton, BoundCallback, CustomEventCallback } from '../../microbit-web-bluetooth-react';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';

type Props = {
    button: 'a' | 'b';
}

export default function MicrobitButtonState(props: Props) {
    const [state, setState] = useState<ButtonState | '-'>('-');

    const handler: CustomEventCallback<ButtonState> = (event) => {
        setState(event.detail);
    };
    const onButtonAStateChanged = props.button === 'a' ? handler : undefined;
    const onButtonBStateChanged = props.button === 'b' ? handler : undefined;

    const onServiceBound: BoundCallback<ButtonService> = (bound) => {
        // NOTE: ButtonState.Release = 0
        setState(bound.binding ? 0 : '-');
    };

    return (
        <React.Fragment>
            <MicrobitButton onButtonAStateChanged={onButtonAStateChanged} onButtonBStateChanged={onButtonBStateChanged} onServiceBound={onServiceBound} />
            {state}
        </React.Fragment>
    );
}
