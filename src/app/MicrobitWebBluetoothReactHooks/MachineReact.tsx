import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createActorContext } from '@xstate/react'; // yarn add --dev xstate @xstate/react
import { createBluetoothMachine } from './Machine';
import MicrobitConnection from './MachineContext';

const connection = new MicrobitConnection();
const MicrobitContext = createActorContext(createBluetoothMachine(window.navigator.bluetooth, connection));

export const useMicrobitActor = () => MicrobitContext.useActor();
export const useMicrobitActorRef = () => MicrobitContext.useActorRef();

function MicrobitContextProviderInitialization({ children }) {
    const [state, send] = useMicrobitActor();
    const cb = useCallback(() => send("LOST"), []);
    useEffect(() => {
        console.log("MicrobitContextProviderInitialization: set")
        state.context.microbit.setGattServerDisconnectedCallback(cb);
        return () => {
            console.log("MicrobitContextProviderInitialization: unset")
            state.context.microbit.setGattServerDisconnectedCallback(undefined);
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
        <MicrobitContext.Provider>
            <MicrobitContextProviderInitialization>
                {children}
            </MicrobitContextProviderInitialization>
        </MicrobitContext.Provider>
    );
}
