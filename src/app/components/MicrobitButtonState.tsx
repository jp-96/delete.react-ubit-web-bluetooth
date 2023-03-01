import React, { useState } from 'react';
import { MicrobitButton, BoundCallback, CustomEventCallback } from '../microbit-web-bluetooth-react';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';

type Props = {
    button: 'a' | 'b';
}

export default function MicrobitButtonState(props: Props) {
    const [state, setState] = useState<ButtonState | '-'>('-');

    const handler: CustomEventCallback<ButtonState> = event => {
        console.log("onButton(A|B)StateChanged:", event.detail);
        setState(event.detail);
    };
    const onButtonAStateChanged = props.button === 'a' ? handler : undefined;
    const onButtonBStateChanged = props.button === 'b' ? handler : undefined;

    const onServiceBound: BoundCallback<ButtonService> = async bound => {
        // NOTE: ButtonState.Release = 0
        // setState(bound.binding ? 0 : '-');
        if (bound.binding) {
            const s = props.button === 'a' ? await bound.target.readButtonAState() : await bound.target.readButtonBState();
            console.log("readButton(A|B)State:", s);
            setState(s);
        } else {
            setState("-")
        }
    };

    return (
        <React.Fragment>
            <MicrobitButton onButtonAStateChanged={onButtonAStateChanged} onButtonBStateChanged={onButtonBStateChanged} onServiceBound={onServiceBound} />
            {state}
        </React.Fragment>
    );
}
