import {requestMicrobit, getServices, Services} from 'microbit-web-bluetooth';  // yarn add --dev microbit-web-bluetooth
//import { Types, useDevicesState } from './DevicesState';
//import { Types, useDevicesState } from './DeviceState';
import { Types, useDevicesState } from './DeviceReducer';

export const useMicrobitBLE = (bluetooth: Bluetooth) => {
    const [state, dispatch] = useDevicesState();

    console.log('(useMicrobitBLE) state:', state);

    const connectInto = (tag: string, device: BluetoothDevice) => {
        getServices(device).then((services) => {
            dispatch({tag, type: Types.CONNECTED, services, });
            // TODO: services bind
        }).catch((e) => {
            dispatch({tag, type: Types.ERROR, reason: JSON.stringify(e),});
        });
    };

    const request = async (tag: string) => {
        dispatch({tag, type:Types.REQUEST,});
        requestMicrobit(bluetooth).then((device) => {
            if (device) {
                device.addEventListener("gattserverdisconnected", (ev) => {
                    console.log('gattserverdisconnected', tag, ev.currentTarget);
                });
                dispatch({tag, type: Types.CONNECT, device,});
                connectInto(tag, device);
            } else {
                //
                console.log('device is undefined');
            }
        }).catch((e) => {
            dispatch({tag, type: Types.ERROR, reason: JSON.stringify(e),});
        });
    };

    const connect = async (tag: string) => {
        const device = state.device.device;
        if (device) {
            dispatch({tag, type: Types.CONNECT, device})
            connectInto(tag, device);
        } else {
            console.log('(connect) missing device.');
        }
    }

    const disconnect = async (tag: string) => {
        const device = state.device.device;
        if (device && device.gatt) {
            dispatch({tag, type: Types.DISCONNECT,})
            device.gatt.disconnect();
        } else {
            console.log('(disconnect) missing device or gatt');
        }
    }

    return {
        state,
        request,
        connect,
        disconnect,
    };
}
