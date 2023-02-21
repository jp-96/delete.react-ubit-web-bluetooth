import React, { createContext, useContext, useState, useEffect } from 'react';
import { createActorContext } from '@xstate/react';
import { createMicrobitBluetoothMachine, BindServicesCallback } from './MicrobitBluetoothMachine';

const MicrobitBluetoothMachineContext = createActorContext(createMicrobitBluetoothMachine(window.navigator.bluetooth, 'MicrobitBluetoothMachineContext'));

export const useContextActor = () => MicrobitBluetoothMachineContext.useActor();
export const useContextActorRef = () => MicrobitBluetoothMachineContext.useActorRef();

export function useBindServicesCallback(cb: BindServicesCallback) {
    const [state] = useContextActor();
    useEffect(() => {
        console.log("useBindServicesCallback: set")
        state.context.cb.bindServices = cb;
        return () => {
            console.log("useBindServicesCallback: unset")
            state.context.cb.bindServices = undefined;
        };
    }, []);
}

function MicrobitBluetoothMachineContextProviderInitialization({ children }) {
    const service = useContextActorRef();
    useEffect(() => {
        const context = service.getSnapshot()?.context;
        console.log("MicrobitBluetoothMachineContextProviderInitialization: set");
        context && (context.cb.sendDisconnect = () => service.send("LOST"));
        return () => {
            console.log("MicrobitBluetoothMachineContextProviderInitialization: unset")
            context && (context.cb.sendDisconnect = undefined);
        };
    }, []);
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}

export default function MicrobitBluetoothMachineContextProvider({ children }) {
    return (
        <MicrobitBluetoothMachineContext.Provider>
            <MicrobitBluetoothMachineContextProviderInitialization>
                {children}
            </MicrobitBluetoothMachineContextProviderInitialization>
        </MicrobitBluetoothMachineContext.Provider>
    );
}
