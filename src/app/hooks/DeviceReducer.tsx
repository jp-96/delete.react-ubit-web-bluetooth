import { useReducer } from 'react';
import { Services } from 'microbit-web-bluetooth';  // yarn add --dev microbit-web-bluetooth

export const Types = {
    RESET: "RESET",
    REQUEST: "REQUEST",
    CONNECT: "CONNECT",
    CANCELED: "CANCELED",
    REJECTED: "REJECTED",
    CONNECTED: "CONNECTED",
    ERROR: "ERROR",
    DISCONNECT: "DISCONNECT",
    DISCONNECTED: "DISCONNECTED",
} as const;

type ResetAction = {
    tag: string;
    type: typeof Types.RESET;
}

type RequestAction = {
    tag: string;
    type: typeof Types.REQUEST;
    entry: () => void;
}

type ConnectAction = {
    tag: string;
    type: typeof Types.CONNECT;
    device?: BluetoothDevice;
    entry: (device: BluetoothDevice) => void;
}

type RejectedAction = {
    tag: string;
    type: typeof Types.REJECTED;
    reason: string;
}

type ConnectedAction = {
    tag: string;
    type: typeof Types.CONNECTED;
    services: Services;
    entry: (services: Services) => void;
}

type ErrorAction = {
    tag: string;
    type: typeof Types.ERROR;
    reason: string;
}

type DisconnectAction = {
    tag: string;
    type: typeof Types.DISCONNECT;
    entry: (gatt: BluetoothRemoteGATTServer) => void;
}

type DisconnectedAction = {
    tag: string;
    type: typeof Types.DISCONNECTED;
    entry: (services: Services) => void;
}

type Actions = ResetAction
             | RequestAction
             | ConnectAction
             | RejectedAction
             | ConnectedAction
             | ErrorAction
             | DisconnectAction
             | DisconnectedAction;

const DeviceState = {
    UNDEFINED: "UNDEFINED",
    REQUEST: "REQUEST",
    REJECTED: "REJECTED",
    CONNECT: "CONNECT",
    CONNECTED: "CONNECTED",
    DISCONNECT: "DISCONNECT",
    DISCONNECTED: "DISCONNECTED",
} as const;

type DeviceStateType = typeof DeviceState[keyof typeof DeviceState];

export type Device = {
    tag: string;
    state: DeviceStateType;
    stateInfo: string;
    device?: BluetoothDevice;
    services?: Services;
}

export type State = {
    device: Device;
};

const defaultState: State = {
    device: {
        tag: '',
        state: DeviceState.UNDEFINED,
        stateInfo: '(undefined)',
    },
};

const reducer = (state: State, action: Actions): State => {
    console.log("action:", action);
    const tag = action.tag;
    let device = state.device;
    switch (action.type) {
        case Types.RESET:
            switch (device.state) {
                case DeviceState.REJECTED:
                case DeviceState.DISCONNECT:
                    // to UNDEFINED
                    device = {tag, state: DeviceState.UNDEFINED, stateInfo: '(undefined)'};
                    break;
                default:
                    break;
            }
            break;
        case Types.REQUEST:
            switch (device.state) {
                case DeviceState.UNDEFINED:
                case DeviceState.REJECTED:
                case DeviceState.DISCONNECTED:
                    // to REQUEST
                    action.entry();
                    device = {tag, state: DeviceState.REQUEST, stateInfo: 'requestDevice()'};
                    break;
                default:
                    break;
            }
            break;
        case Types.CONNECT:
            switch (device.state) {
                case DeviceState.REQUEST:
                case DeviceState.DISCONNECTED:
                    const bluetoothDevice = action.device ?? device.device;
                    if (bluetoothDevice) {
                        // to CONNECT
                        action.entry(bluetoothDevice);
                        device.state = DeviceState.CONNECT;
                        device.stateInfo = 'getServices()';
                        device.device = bluetoothDevice;
                    } else {
                        // to UNDEFINED
                        device = {tag, state: DeviceState.UNDEFINED, stateInfo: 'Panic, BluetoothDevice.'};
                    }
                    break;
                default:
                    break;
            }
            break;
        case Types.REJECTED:
            switch (device.state) {
                case DeviceState.REQUEST:
                    // to REJECTED
                    device.state = DeviceState.REJECTED;
                    device.stateInfo = action.reason;
                    break;
                default:
                    break;
            }
            break;
        case Types.CONNECTED:
            switch (device.state) {
                case DeviceState.CONNECT:
                    // to CONNECTED
                    action.entry(action.services);
                    device.state = DeviceState.CONNECTED;
                    device.stateInfo = 'Connected';
                    device.services = action.services;
                    break;
                default:
                    break;
            }
            break;
        case Types.ERROR:
            switch (device.state) {
                case DeviceState.CONNECT:
                    // to DISCONNECTED
                    device.state = DeviceState.DISCONNECTED;
                    device.stateInfo = action.reason;
                    break;
                default:
                    break;
            }
            break;
        case Types.DISCONNECT:
            switch (device.state) {
                case DeviceState.CONNECTED:
                    const gatt = device.device?.gatt;
                    if (gatt) {
                        // to DISCONNECT
                        action.entry(gatt);
                        device.state = DeviceState.DISCONNECT;
                        device.stateInfo = 'gatt.disconnect()';
                    } else {
                        // to UNDEFINED
                        device = {tag, state: DeviceState.UNDEFINED, stateInfo: 'Panic, BluetoothRemoteGATTServer.'};
                    }
                    break;
                default:
                    break;
            }
            break;
        case Types.DISCONNECTED:
            switch (device.state) {
                case DeviceState.CONNECT:
                case DeviceState.CONNECTED:
                case  DeviceState.DISCONNECT:
                    // to DISCONNECTED
                    if (device.services) {
                        action.entry(device.services);
                    }
                    device.state = DeviceState.DISCONNECTED;
                    device.stateInfo = 'Disconnected';
                    device.services = undefined;
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    const newState: State = { device };
    console.log("(reducer): ", newState);
    return newState;
};

export const useDevicesState = (initialState?: State) => useReducer(reducer, initialState ?? defaultState);
