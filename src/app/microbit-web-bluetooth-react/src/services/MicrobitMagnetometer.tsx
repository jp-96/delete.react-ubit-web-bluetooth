import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { MagnetometerService } from 'microbit-web-bluetooth/types/services/magnetometer';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<MagnetometerService> {
}

export function MicrobitMagnetometer(props: Props) {
    
    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.magnetometerService;
        if (target) {
            if (props.onServiceBound) {
                props.onServiceBound({ ...bound, target});
            }
        }
    };

    return (
        <MicrobitServices onServicesBound={onServicesBound} />
    );
}
