import React, { useEffect, useState } from 'react';
import { ServiceProps } from './Microbit';
import { ServicesBoundCallback } from '../StateMachine/MachineContext';
import { MicrobitServices } from './MicroBitServices';
import { AccelerometerData, AccelerometerPeriod, AccelerometerService } from 'microbit-web-bluetooth/types/services/accelerometer';

export type AccelerometerDataChangedCallback = (event: CustomEvent<AccelerometerData>) => void;

interface Props extends ServiceProps<AccelerometerService> {
    onAccelerometerDataChanged?: AccelerometerDataChangedCallback;
    accelerometerPeriod?: AccelerometerPeriod;
}

const accelerometerdatachanged = 'accelerometerdatachanged';

export function MicrobitAccelerometerService(props: Props) {
    const [accelerometerService, setAccelerometer] = useState<AccelerometerService | undefined>(undefined);
    
    const cb: ServicesBoundCallback = (services, binding) => {
        const accelerometerService = services.accelerometerService;
        if (accelerometerService){
            if (binding) {
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
                props.onServiceBound(accelerometerService, binding);
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
