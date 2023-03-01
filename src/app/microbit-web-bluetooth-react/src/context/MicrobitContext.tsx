import React, { EffectCallback } from 'react';
import { State } from 'xstate'; // yarn add --dev xstate
import { createActorContext } from '@xstate/react'; // yarn add --dev @xstate/react
import { createContext, machineWithoutContext } from '../statemachine/Machine';
import { Connection, Context, BoundCallback } from '../statemachine/Context';
import { Services } from 'microbit-web-bluetooth';

const MicrobitActorContext = createActorContext(machineWithoutContext);

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

type Props = {
    children: any;
    connectionName?: string;
}

export function MicrobitContextProvider(props: Props) {
    const context = createContext(new Connection(window.navigator.bluetooth, props.connectionName));
    return (
        <MicrobitActorContext.Provider machine={() => machineWithoutContext.withContext(context)}>
            {props.children}
        </MicrobitActorContext.Provider>
    );
}

// helper

type StateWithContext = State<Context, any, any, any, any>;
type ConnectionContainer = StateWithContext | Context | Connection

export function RefConnection(cc: ConnectionContainer): Connection {
    if (cc as StateWithContext) {
        return (cc as StateWithContext).context.conn;
    }
    if (cc as Context) {
        return (cc as Context).conn;
    }
    if (cc as Connection) {
        return (cc as Connection);
    }
    return undefined!;
}

export function DeviceEffector(cc: ConnectionContainer, cb: BoundCallback<BluetoothDevice>): EffectCallback {
    return () => {
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */

        //console.log("DeviceEffector init:", cb)
        const conn = RefConnection(cc);
        conn.addDeviceBoundCallback(cb);
        return () => {
            //console.log("DeviceEffector deinit:", cb)
            conn.removeDeviceBoundCallback(cb);
        };
    }
}

export function ServicesEffector(cc: ConnectionContainer, cb: BoundCallback<Services>): EffectCallback {
    return () => {
        /**
         * NOTE:
         * When StrictMode is enabled, React intentionally double-invokes
         * effects (mount -> unmount -> mount) for newly mounted components. 
         * https://github.com/reactwg/react-18/discussions/19
         */

        //console.log("ServicesEffector init:", cb)
        const conn = RefConnection(cc);
        conn.addServicesBoundCallback(cb);
        return () => {
            //console.log("ServicesEffector deinit:", cb)
            conn.removeServicesBoundCallback(cb);
        };
    }
}

// type, interface

export type CustomEventCallback<T> = (event: CustomEvent<T>) => void;

export interface ServiceProps<T> {
    //children?: any;
    onServiceBound?: BoundCallback<T>;
}
