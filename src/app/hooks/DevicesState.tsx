import { useImmerReducer } from "use-immer";    // yarn add --dev use-immer
import {requestMicrobit, getServices, Services} from 'microbit-web-bluetooth';  // yarn add --dev microbit-web-bluetooth

export enum Types {
    RESET = "RESET",
    REQUEST = "REQUEST",
    CONNECT = "CONNECT",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED",
    CONNECTED = "CONNECTED",
    ERROR = "ERROR",
    DISCONNECT = "DISCONNECT",
    DISCONNECTED = "DISCONNECTED",
};

type ResetAction = {
    tag: string;
    type: Types.RESET;
}

type RequestAction = {
    tag: string;
    type: Types.REQUEST;
}

type ConnectAction = {
    tag: string;
    type: Types.CONNECT;
    device: BluetoothDevice;
}

type CanceledAction = {
    tag: string;
    type: Types.CANCELED;
}

type RejectedAction = {
    tag: string;
    type: Types.REJECTED;
    reason: string;
}

type ConnectedAction = {
    tag: string;
    type: Types.CONNECTED;
    services: Services;
}

type ErrorAction = {
    tag: string;
    type: Types.ERROR;
    reason: string;
}

type DisconnectAction = {
    tag: string;
    type: Types.DISCONNECT;
}

type DisconnectedAction = {
    tag: string;
    type: Types.DISCONNECTED;
}


type Actions = ResetAction
             | RequestAction
             | ConnectAction
             | CanceledAction
             | RejectedAction
             | ConnectedAction
             | ErrorAction
             | DisconnectAction
             | DisconnectedAction;

enum DeviceState {
    UNDEFINED = "UNDEFINED",
    REQUEST = "REQUEST",
    REJECTED = "REJECTED",
    CONNECT = "CONNECT",
    CONNECTED = "CONNECTED",
    DISCONNECT = "DISCONNECT",
    DISCONNECTED = "DISCONNECTED",
}

type Device = {
    tag: string;
    state: DeviceState;
    stateInfo: string;
    device?: BluetoothDevice;
    services?: Services;
}

export type State = {
    devices: Object;
};

const defaultState: State = {
    devices: {},
};

const reducer = (draft: State, action: Actions) => {
    console.log('Action:', action);
    const tag = action.tag;
    switch (action.type) {
        case Types.RESET:
            if (draft.devices[tag].state in [DeviceState.REJECTED, DeviceState.DISCONNECT]) {
                // to UNDEFINED
                draft.devices[tag] = {tag, state: DeviceState.UNDEFINED, stateInfo: '(undefined)'};
            }
            break;
        case Types.REQUEST:
            if (!draft.devices[tag] || draft.devices[tag].state in [DeviceState.UNDEFINED, DeviceState.REJECTED]) {
                // to REQUEST
                draft.devices[tag] = {tag, state: DeviceState.REQUEST, stateInfo: 'requestDevice()'};
            }
            break;
        case Types.CONNECT:
            if (draft.devices[tag].state in [DeviceState.REQUEST, DeviceState.DISCONNECTED]) {
                // to CONNECT
                const device: Device = {tag, state: DeviceState.CONNECT, stateInfo: 'getServices()', device: action.device, };
                draft.devices[tag] = device;
            }
            break;
        case Types.CANCELED:
            if (draft.devices[tag].state in [DeviceState.REQUEST]) {
                // to state
                draft.devices[tag].state = DeviceState.REJECTED;
                draft.devices[tag].stateInfo = "User Canceled"
            }
            break;
        case Types.REJECTED:
            if (draft.devices[tag].state in [DeviceState.REQUEST]) {
                // to state
                draft.devices[tag].state = DeviceState.REJECTED;
                draft.devices[tag].stateInfo = action.reason;
            }
            break;
        case Types.CONNECTED:
            if (draft.devices[tag].state in [DeviceState.CONNECT]) {
                // to state
                draft.devices[tag].state = DeviceState.CONNECTED;
                draft.devices[tag].stateInfo = 'Connected';
                draft.devices[tag].services = action.services;
            }
            break;
        case Types.ERROR:
            if (draft.devices[tag].state in [DeviceState.CONNECT]) {
                // to state
                draft.devices[tag].state = DeviceState.DISCONNECTED;
                draft.devices[tag].stateInfo = action.reason;
            }
            break;
        case Types.DISCONNECT:
            if (draft.devices[tag].state in [DeviceState.CONNECTED]) {
                // to state
                draft.devices[tag].state = DeviceState.DISCONNECT;
                draft.devices[tag].stateInfo = 'gatt.disconnect()';
            }
            break;
        case Types.DISCONNECTED:
            if (draft.devices[tag].state in [DeviceState.CONNECT, DeviceState.CONNECTED, DeviceState.DISCONNECT]) {
                // to state
                draft.devices[tag].state = DeviceState.DISCONNECTED;
                draft.devices[tag].stateInfo = 'Disconnected';
                draft.devices[tag].services = undefined;
            }
            break;
        default:
            break;
    }
};

export const useDevicesState = (initialState?: State) => useImmerReducer(reducer, initialState ?? defaultState);
