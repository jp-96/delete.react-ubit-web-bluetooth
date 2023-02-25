import React, { useState } from 'react';
import { ButtonStateChangedCallback, MicrobitButtonService } from '../microbit-web-bluetooth-react';

type ButtonA = 'a';
type ButtonB = 'b';
type ButtonType = ButtonA | ButtonB;

type Props = {
    watching: ButtonType;
}

export default function MicroBitButton(props: Props) {
    const [button, setButton] = useState(0);

    const cb: ButtonStateChangedCallback = (event) => {
        setButton(event.detail);
    };

    const cbA = props.watching === 'a' ? cb : undefined;
    const cbB = props.watching === 'b' ? cb : undefined;

    return (
        <MicrobitButtonService onButtonAStateChanged={cbA} onButtonBStateChanged={cbB} >
            {button}
        </MicrobitButtonService>
    );
}
