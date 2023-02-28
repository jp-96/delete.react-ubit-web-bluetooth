import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/Microbit';
import { BoundCallback } from '../statemachine/MachineContext';
import { MicrobitServices } from '../context/MicroBitServices';
import { Services } from 'microbit-web-bluetooth';
import { AccelerometerData, AccelerometerPeriod, AccelerometerService } from 'microbit-web-bluetooth/types/services/accelerometer';

interface Props extends ServiceProps<AccelerometerService> {
    onAccelerometerDataChanged?: CustomEventCallback<AccelerometerData>;
    accelerometerPeriod?: AccelerometerPeriod;
}

const accelerometerdatachanged = 'accelerometerdatachanged';

export function MicrobitAccelerometerService(props: Props) {
    const [accelerometerService, setAccelerometer] = useState<AccelerometerService | undefined>(undefined);

    const cb: BoundCallback<Services> = (bound) => {
        const accelerometerService = bound.target.accelerometerService;
        if (accelerometerService) {
            if (bound.binding) {
                if (props.onAccelerometerDataChanged) {
                    accelerometerService.addEventListener(accelerometerdatachanged, props.onAccelerometerDataChanged)
                }
                setAccelerometer(accelerometerService);
            } else {
                if (props.onAccelerometerDataChanged) {
                    accelerometerService.removeEventListener(accelerometerdatachanged, props.onAccelerometerDataChanged)
                }
                setAccelerometer(undefined);
            }
            if (props.onServiceBound) {
                props.onServiceBound({ target: accelerometerService, binding: bound.binding });
            }
        }
    }

    useEffect(() => {
        if (accelerometerService && props.accelerometerPeriod) {
            accelerometerService.setAccelerometerPeriod(props.accelerometerPeriod);
        }
    }, [accelerometerService, props.accelerometerPeriod]);

    return (
        <MicrobitServices onServicesBound={cb} />
    );
}
