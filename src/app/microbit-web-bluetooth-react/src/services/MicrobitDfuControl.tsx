import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { DfuControlService } from 'microbit-web-bluetooth/types/services/dfu-control';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<DfuControlService> {
}

export function MicrobitDfuControl(props: Props) {
    
    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.dfuControlService;
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
