import React, { useEffect, useCallback, EffectCallback } from 'react';
import { State } from 'xstate'; // yarn add --dev xstate
import { createActorContext } from '@xstate/react'; // yarn add --dev @xstate/react
import { createMicrobitMachine } from '../Machine';
import { Connection, Context, DeviceCallback, GattServerDisconnectedEventCallback, ServicesCallback } from '../MachineContext';

const MicrobitActorContext = createActorContext(createMicrobitMachine(new Connection(window.navigator.bluetooth)));

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

function MicrobitContextProviderInitialization({ children }) {
    const [state, send] = useMicrobitActor();
    const cb = useCallback<GattServerDisconnectedEventCallback>(() => send("LOST"), []);
    useEffect(() => {
        const conn = state.context.conn;
        conn.setGattServerDisconnectedEventCallback(cb);
        return () => {
            conn.setGattServerDisconnectedEventCallback(undefined);
        };
    }, [cb]);
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export default function MicrobitContextProvider({ children }) {
    return (
        <MicrobitActorContext.Provider>
            <MicrobitContextProviderInitialization>
                {children}
            </MicrobitContextProviderInitialization>
        </MicrobitActorContext.Provider>
    );
}

// helper


type StateWithContext = State<Context, any, any, any, any>;

export function DeviceEffector(state: StateWithContext, cb: DeviceCallback): EffectCallback {
    return () => {
        const conn = state.context.conn;
        conn.addDeviceCallback(cb);
        return () => {
            conn.removeDeviceCallback(cb);
        };
    }
}

export function ServicesEffector(state: StateWithContext, cb: ServicesCallback): EffectCallback {
    return () => {
        const conn = state.context.conn;
        conn.addServicesCallback(cb);
        return () => {
            conn.addServicesCallback(cb);
        };
    }
}
