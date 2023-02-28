import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { IoPinService } from 'microbit-web-bluetooth/types/services/io-pin';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<IoPinService> {
}

export function MicrobitIoPin(props: Props) {
    
    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.ioPinService;
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
