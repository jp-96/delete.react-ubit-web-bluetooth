import React, { EffectCallback } from 'react';
import { State } from 'xstate'; // yarn add --dev xstate
import { createActorContext } from '@xstate/react'; // yarn add --dev @xstate/react
import { createMicrobitMachine } from '../statemachine/Machine';
import { Connection, Context, BoundCallback, ServiceBoundCallback, ServicesBoundCallback } from '../statemachine/MachineContext';

const MicrobitActorContext = createActorContext(createMicrobitMachine(new Connection(window.navigator.bluetooth)));

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

export function MicrobitContextProvider({ children }) {
    return (
        <MicrobitActorContext.Provider>
            {children}
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

export function ServicesEffector(cc: ConnectionContainer, cb: ServicesBoundCallback): EffectCallback {
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

// interface

export interface ServiceProps<T> {
    //children?: any;
    onServiceBound?: ServiceBoundCallback<T>;
}
