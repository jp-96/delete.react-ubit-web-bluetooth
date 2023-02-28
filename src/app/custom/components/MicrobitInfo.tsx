import React, { useState } from 'react';
import { BoundCallback, MicrobitDevice } from '../../microbit-web-bluetooth-react';

type Props = {
    infoName: 'id' | 'name';
}

const defaultInfo = '(none)';

export default function MicroBitInfo(props: Props) {
    const [info, setInfo] = useState<string>(defaultInfo);

    const onDeviceBound: BoundCallback<BluetoothDevice> = (bound) => {
        if (bound.binding) {
            setInfo(bound.target[props.infoName] ?? defaultInfo);
        } else {
            setInfo(defaultInfo);
        }
    }
    return (
        <React.Fragment>
            <MicrobitDevice onDeviceBound={onDeviceBound} />
            {info}
        </React.Fragment>
    );
}
