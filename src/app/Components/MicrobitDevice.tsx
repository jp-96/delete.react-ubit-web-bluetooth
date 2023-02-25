import React, { useCallback, useEffect, useState } from 'react';
import { DeviceCallback } from '../microbit-web-bluetooth-react/MachineContext';
import { DeviceEffector, useMicrobitActor } from '../microbit-web-bluetooth-react/Components/Microbit';

type PropertyID = 'id';
type PropertyName = 'name';
type PropertyType = PropertyID | PropertyName;

type Props = {
    display: PropertyType;
}

export default function MicroBitDevice(props: Props) {
    const [state] = useMicrobitActor();
    const [value, setValue] = useState<string | undefined>(undefined);

    const cb = useCallback<DeviceCallback>((device, binding) => {
        if (binding) {
            setValue(device[props.display]);
        } else {
            setValue(undefined);
        }
    }, []);
    useEffect(DeviceEffector(state, cb), []);

    return (
        <React.Fragment>
            {value}
        </React.Fragment>
    );
}
