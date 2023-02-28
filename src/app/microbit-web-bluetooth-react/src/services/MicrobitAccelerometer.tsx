import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { AccelerometerData, AccelerometerPeriod, AccelerometerService } from 'microbit-web-bluetooth/types/services/accelerometer';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<AccelerometerService> {
    onAccelerometerDataChanged?: CustomEventCallback<AccelerometerData>;
    accelerometerPeriod?: AccelerometerPeriod;
}

const accelerometerdatachanged = 'accelerometerdatachanged';

export function MicrobitAccelerometer(props: Props) {
    const [service, setService] = useState<AccelerometerService | undefined>(undefined);

    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.accelerometerService;
        if (target) {
            if (bound.binding) {
                if (props.onAccelerometerDataChanged) {
                    target.addEventListener(accelerometerdatachanged, props.onAccelerometerDataChanged)
                }
                setService(target);
            } else {
                if (props.onAccelerometerDataChanged) {
                    target.removeEventListener(accelerometerdatachanged, props.onAccelerometerDataChanged)
                }
                setService(undefined);
            }
            if (props.onServiceBound) {
                props.onServiceBound({ ...bound, target });
            }
        }
    };

    useEffect(() => {
        if (service && props.accelerometerPeriod) {
            service.setAccelerometerPeriod(props.accelerometerPeriod);
        }
    }, [service, props.accelerometerPeriod]);

    return (
        <MicrobitServices onServicesBound={onServicesBound} />
    );
}
