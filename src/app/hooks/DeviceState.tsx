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

export type Device = {
    tag: string;
    state: DeviceState;
    stateInfo: string;
    device?: BluetoothDevice;
    services?: any;
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

const reducer = (draft: State, action: Actions) => {
    console.log('Action:', action);
    const tag = action.tag;
    switch (action.type) {
        case Types.RESET:
            if (draft.device.state in [DeviceState.REJECTED, DeviceState.DISCONNECT]) {
                // to UNDEFINED
                draft.device = {tag, state: DeviceState.UNDEFINED, stateInfo: '(undefined)'};
            }
            break;
        case Types.REQUEST:
            if (draft.device.state in [DeviceState.UNDEFINED, DeviceState.REJECTED]) {
                // to REQUEST
                draft.device = {tag, state: DeviceState.REQUEST, stateInfo: 'requestDevice()'};
            }
            break;
        case Types.CONNECT:
            if (draft.device.state in [DeviceState.REQUEST, DeviceState.DISCONNECTED]) {
                // to CONNECT
                draft.device = {tag, state: DeviceState.CONNECT, stateInfo: 'getServices()', device: action.device, };
            }
            break;
        case Types.CANCELED:
            if (draft.device.state in [DeviceState.REQUEST]) {
                // to state
                draft.device.state = DeviceState.REJECTED;
                draft.device.stateInfo = "User Canceled"
            }
            break;
        case Types.REJECTED:
            if (draft.device.state in [DeviceState.REQUEST]) {
                // to state
                draft.device.state = DeviceState.REJECTED;
                draft.device.stateInfo = action.reason;
            }
            break;
        case Types.CONNECTED:
            if (draft.device.state in [DeviceState.CONNECT]) {
                // to state
                draft.device.state = DeviceState.CONNECTED;
                draft.device.stateInfo = 'Connected';
                draft.device.services = action.services;
            }
            break;
        case Types.ERROR:
            if (draft.device.state in [DeviceState.CONNECT]) {
                // to state
                draft.device.state = DeviceState.DISCONNECTED;
                draft.device.stateInfo = action.reason;
            }
            break;
        case Types.DISCONNECT:
            if (draft.device.state in [DeviceState.CONNECTED]) {
                // to state
                draft.device.state = DeviceState.DISCONNECT;
                draft.device.stateInfo = 'gatt.disconnect()';
            }
            break;
        case Types.DISCONNECTED:
            if (draft.device.state in [DeviceState.CONNECT, DeviceState.CONNECTED, DeviceState.DISCONNECT]) {
                // to state
                draft.device.state = DeviceState.DISCONNECTED;
                draft.device.stateInfo = 'Disconnected';
                draft.device.services = undefined;
            }
            break;
        default:
            break;
    }
};

export const useDevicesState = (initialState?: State) => useImmerReducer(reducer, initialState ?? defaultState);
