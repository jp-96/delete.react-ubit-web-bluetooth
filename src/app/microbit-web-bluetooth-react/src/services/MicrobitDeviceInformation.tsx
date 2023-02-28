import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { DeviceInformationService } from 'microbit-web-bluetooth/types/services/device-information';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<DeviceInformationService> {
}

export function MicrobitDeviceInformation(props: Props) {
    
    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.deviceInformationService;
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
