import React, { createContext, useContext, useState, useEffect } from 'react';
import { createActorContext } from '@xstate/react'; // yarn add --dev xstate @xstate/react
import { createBluetoothMachine, BindServicesCallback } from './StateMachine';

const MicrobitContext = createActorContext(createBluetoothMachine(window.navigator.bluetooth, 'MicrobitContext'));

export const useMicrobitActor = () => MicrobitContext.useActor();
export const useMicrobitActorRef = () => MicrobitContext.useActorRef();

export function useBindServicesCallback(cb: BindServicesCallback) {
    const [state] = useMicrobitActor();
    useEffect(() => {
        console.log("useBindServicesCallback: set")
        state.context.cb.bindServices = cb;
        return () => {
            console.log("useBindServicesCallback: unset")
            state.context.cb.bindServices = undefined;
        };
    }, []);
}

function MicrobitContextProviderInitialization({ children }) {
    const service = useMicrobitActorRef();
    useEffect(() => {
        const context = service.getSnapshot()?.context;
        console.log("MicrobitContextProviderInitialization: set");
        context && (context.cb.sendDisconnect = () => service.send("LOST"));
        return () => {
            console.log("MicrobitContextProviderInitialization: unset")
            context && (context.cb.sendDisconnect = undefined);
        };
    }, []);
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
