import React, { useState } from 'react';
import { MicrobitButtonService, BoundCallback, CustomEventCallback } from '../../microbit-web-bluetooth-react';
import { ButtonService, ButtonState } from 'microbit-web-bluetooth/types/services/button';

type ButtonA = 'a';
type ButtonB = 'b';
type ButtonType = ButtonA | ButtonB;

type Props = {
    watching: ButtonType;
}

export default function MicrobitButton(props: Props) {
    const [button, setButton] = useState(0);

    const cb: CustomEventCallback<ButtonState> = (event) => {
        setButton(event.detail);
    };

    const cbBound: BoundCallback<ButtonService> = (bound) => {
        // dummy
    };

    const cbA = props.watching === 'a' ? cb : undefined;
    const cbB = props.watching === 'b' ? cb : undefined;

    return (
        <React.Fragment>
            <MicrobitButtonService onButtonAStateChanged={cbA} onButtonBStateChanged={cbB} onServiceBound={cbBound} />
            {button}
        </React.Fragment>
    );
}
