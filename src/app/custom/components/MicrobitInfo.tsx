import React, { useState } from 'react';
import { BoundCallback, MicrobitDevice } from '../../microbit-web-bluetooth-react';

type PropertyID = 'id';
type PropertyName = 'name';
type PropertyType = PropertyID | PropertyName;

type Props = {
    display: PropertyType;
}

export default function MicroBitInfo(props: Props) {
    const [value, setValue] = useState<string | undefined>(undefined);

    const cb: BoundCallback<BluetoothDevice> = (bound) => {
        if (bound.binding) {
            setValue(bound.target[props.display]);
        } else {
            setValue(undefined);
        }
    }
    return (
        <React.Fragment>
            <MicrobitDevice onDeviceBound={cb} />
            {value}
        </React.Fragment>
    );
}
