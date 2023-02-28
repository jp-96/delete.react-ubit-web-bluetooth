import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { TemperatureService } from 'microbit-web-bluetooth/types/services/temperature';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<TemperatureService> {
}

export function MicrobitTemperature(props: Props) {
    
    const onServicesBound: BoundCallback<Services> = (bound) => {
        const target = bound.target.temperatureService;
        if (target) {
            if (props.onServiceBound) {
                props.onServiceBound({ ...bound, target});
            }
        }
    }

    return (
        <MicrobitServices onServicesBound={onServicesBound} />
    );
}
