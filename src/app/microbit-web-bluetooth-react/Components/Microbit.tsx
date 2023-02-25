import React, { useEffect, useCallback, EffectCallback } from 'react';
import { State } from 'xstate'; // yarn add --dev xstate
import { createActorContext } from '@xstate/react'; // yarn add --dev @xstate/react
import { createMicrobitMachine } from '../StateMachine/Machine';
import { Connection, Context, DeviceBoundCallback, ServicesBoundCallback } from '../StateMachine/MachineContext';

const MicrobitActorContext = createActorContext(createMicrobitMachine(new Connection(window.navigator.bluetooth)));

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

function MicrobitContextProviderInitialization({ children }) {
    const [state, send] = useMicrobitActor();
    useEffect(() => {
        // TODO: Using XState Callback, parent <--ParentSend-- child(waiting gatt.disconnected).
        const conn = state.context.conn;
        conn.setGattServerDisconnectedCallback(() => send("LOST"));
        return () => {
            conn.setGattServerDisconnectedCallback(undefined);
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

export function DeviceEffector(state: StateWithContext, cb: DeviceBoundCallback): EffectCallback {
    return () => {
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */
        
        //console.log("DeviceEffector init:", cb)
        const conn = state.context.conn;
        conn.addDeviceBoundCallback(cb);
        return () => {
            //console.log("DeviceEffector deinit:", cb)
            conn.removeDeviceBoundCallback(cb);
        };
    }
}

export function ServicesEffector(state: StateWithContext, cb: ServicesBoundCallback): EffectCallback {
    return () => {
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */

        //console.log("ServicesEffector init:", cb)
        const conn = state.context.conn;
        conn.addServicesBoundCallback(cb);
        return () => {
            //console.log("ServicesEffector deinit:", cb)
            conn.removeServicesBoundCallback(cb);
        };
    }
}

// interface/type

type ServiceBoundCallback<T> = (service: T, binding: boolean) => void;

export interface ServiceProps<T> {
    children?: any;
    onServiceBound?: ServiceBoundCallback<T>;
}
