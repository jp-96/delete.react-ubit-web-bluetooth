import React, { useEffect, useState } from 'react';
import { CustomEventCallback, ServiceProps } from '../context/MicrobitContext';
import { BoundCallback } from '../statemachine/Context';
import { MicrobitServices } from '../context/MicroBitServices';
import { TemperatureService } from 'microbit-web-bluetooth/types/services/temperature';
import { Services } from 'microbit-web-bluetooth';

interface Props extends ServiceProps<TemperatureService> {
    onTemperatureChanged?: CustomEventCallback<number>;
    /**
     * Determines the frequency with which temperature data is updated in milliseconds(UINT16).
     */
    temperaturePeriod?: number;
}

const temperaturechanged = 'temperaturechanged';

export function MicrobitTemperature(props: Props) {
    const [service, setService] = useState<TemperatureService | undefined>(undefined);

    const onServicesBound: BoundCallback<Services> = bound => {
        const target = bound.target.temperatureService;
        if (target) {
            if (bound.binding) {
                if (props.onTemperatureChanged) {
                    target.addEventListener(temperaturechanged, props.onTemperatureChanged);
                }
                setService(target);
            } else {
                if (props.onTemperatureChanged) {
                    target.removeEventListener(temperaturechanged, props.onTemperatureChanged);
                }
                setService(undefined);
            }
            if (props.onServiceBound) {
                props.onServiceBound({ ...bound, target });
            }
        }
    };
    
    useEffect(() => {
        if (service && props.temperaturePeriod) {
            service.setTemperaturePeriod(props.temperaturePeriod);
        }
    }, [service, props.temperaturePeriod]);

    return (
        <MicrobitServices onServicesBound={onServicesBound} />
    );
}
