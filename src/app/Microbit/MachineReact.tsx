import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createActorContext } from '@xstate/react'; // yarn add --dev xstate @xstate/react
import { createMicrobitMachine } from './Machine';
import { Connection } from './MachineContext';

const MicrobitActorContext = createActorContext(createMicrobitMachine(window.navigator.bluetooth, new Connection()));

export const useMicrobitActor = () => MicrobitActorContext.useActor();
export const useMicrobitActorRef = () => MicrobitActorContext.useActorRef();

function MicrobitContextProviderInitialization({ children }) {
    const [state, send] = useMicrobitActor();
    const cb = useCallback(() => send("LOST"), []);
    useEffect(() => {
        console.log("MicrobitContextProviderInitialization: set ")
        state.context.conn.setGattServerDisconnectedEventCallback(cb);
        return () => {
            console.log("MicrobitContextProviderInitialization: unset")
            state.context.conn.setGattServerDisconnectedEventCallback(undefined);
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
