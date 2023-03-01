import React, { useState } from 'react';
import { MicrobitTemperature, BoundCallback, CustomEventCallback } from '../microbit-web-bluetooth-react';
import { TemperatureService } from 'microbit-web-bluetooth/types/services/temperature';

type Props = {
}

export default function MicrobitTemperatureView(props: Props) {
    const [state, setState] = useState<number | '-'>('-');

    const onTemperatureChanged: CustomEventCallback<number> = event => {
        //console.log("onTemperatureChanged:", event.detail);
        setState(event.detail);
    };

    const onServiceBound: BoundCallback<TemperatureService> = async bound => {
        if (bound.binding) {
            const t = await bound.target.readTemperature();
            //console.log("readTemperature:", t);
            setState(t);
        } else {
            setState("-")
        }
    };

    return (
        <React.Fragment>
            <MicrobitTemperature onTemperatureChanged={onTemperatureChanged} onServiceBound={onServiceBound} temperaturePeriod={5000} />
            {state}
        </React.Fragment>
    );
}
