import React, { createContext, useContext, useState, useEffect } from 'react';
import { createActorContext } from '@xstate/react';
import { createMicrobitBluetoothMachine, BindServicesCallback } from './MicrobitBluetoothMachine';

const MicrobitBluetoothMachineContext = createActorContext(createMicrobitBluetoothMachine(window.navigator.bluetooth, 'MicrobitBluetoothMachineContext'));

export const useContextActor = () => MicrobitBluetoothMachineContext.useActor();

export function useBindServicesCallback(cb: BindServicesCallback) {
    const [state] = MicrobitBluetoothMachineContext.useActor();
    useEffect(() => {
        console.log("useBindServicesCallback: set")
        state.context.cb.bindServices = cb;
        return () => {
            console.log("useBindServicesCallback: unset")
            state.context.cb.bindServices = undefined;
        };
    }, []);
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

function MicrobitBluetoothMachineContextProviderInitialization({ children }) {
    const service = MicrobitBluetoothMachineContext.useActorRef();
    useEffect(() => {
        const context = service.getSnapshot()?.context;
        console.log("MicrobitBluetoothMachineContextProviderInitialization: set");
        context && (context.cb.sendDisconnect = () => service.send("DISCONNECTED"));
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
