import React, { useEffect, useCallback, EffectCallback } from 'react';
import { State } from 'xstate'; // yarn add --dev xstate
import { createActorContext } from '@xstate/react'; // yarn add --dev @xstate/react
import { createMicrobitMachine } from '../Machine';
import { Connection, Context, DeviceCallback, ServicesCallback } from '../MachineContext';

const MicrobitActorContext = createActorContext(createMicrobitMachine(new Connection(window.navigator.bluetooth)));

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

function MicrobitContextProviderInitialization({ children }) {
    const [state, send] = useMicrobitActor();
    useEffect(() => {
        const conn = state.context.conn;
        conn.setGattServerDisconnectedEventCallback(() => send("LOST"));
        return () => {
            conn.setGattServerDisconnectedEventCallback(undefined);
        };
    }, []);
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export function MicrobitContextProvider({ children }) {
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
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */
        
        //console.log("DeviceEffector init:", cb)
        const conn = state.context.conn;
        conn.addDeviceCallback(cb);
        return () => {
            //console.log("DeviceEffector deinit:", cb)
            conn.removeDeviceCallback(cb);
        };
    }
}

export function ServicesEffector(state: StateWithContext, cb: ServicesCallback): EffectCallback {
    return () => {
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */

        //console.log("ServicesEffector init:", cb)
        const conn = state.context.conn;
        conn.addServicesCallback(cb);
        return () => {
            //console.log("ServicesEffector deinit:", cb)
            conn.removeServicesCallback(cb);
        };
    }
}
