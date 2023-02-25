import React, { useState } from 'react';
import { ButtonStateChangedCallback, MicrobitButtonService } from '../microbit-web-bluetooth-react/Components/MicrobitButtonService';

type ButtonA = 'a';
type ButtonB = 'b';
type ButtonType = ButtonA | ButtonB;

type Props = {
    watching: ButtonType;
}

export default function MicroBitButton(props: Props) {
    const [button, setButton] = useState(0);

    const listenButton: ButtonStateChangedCallback = (event) => {
        setButton(event.detail);
    };

    const buttonA = props.watching === 'a' ? listenButton : undefined;
    const buttonB = props.watching === 'b' ? listenButton : undefined;

    return (
        <MicrobitButtonService onButtonAStateChanged={buttonA} onButtonBStateChanged={buttonB} >
            {button}
        </MicrobitButtonService>
    );
}
