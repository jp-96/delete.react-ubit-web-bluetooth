import React, { useCallback, useEffect, useState } from 'react';
import { DeviceBoundCallback } from '../microbit-web-bluetooth-react/StateMachine/MachineContext';
import { DeviceEffector, useMicrobitActor } from '../microbit-web-bluetooth-react/Components/Microbit';
import { MicrobitDevice } from '../microbit-web-bluetooth-react/Components/MicroBitDevice';

type PropertyID = 'id';
type PropertyName = 'name';
type PropertyType = PropertyID | PropertyName;

type Props = {
    display: PropertyType;
}

export default function MicroBitDevice(props: Props) {
    const [value, setValue] = useState<string | undefined>(undefined);

    const cb:DeviceBoundCallback = (device, binding) => {
        if (binding) {
            setValue(device[props.display]);
        } else {
            setValue(undefined);
        }
    }
    return (
        <MicrobitDevice onDeviceBound={cb}>
            {value}
        </MicrobitDevice>
    );
}
