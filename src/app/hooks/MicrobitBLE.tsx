import {requestMicrobit, getServices, Services} from 'microbit-web-bluetooth';  // yarn add --dev microbit-web-bluetooth
//import { Types, useDevicesState } from './DevicesState';
//import { Types, useDevicesState } from './DeviceState';
import { Types, useDevicesState } from './DeviceReducer';

export const useMicrobitBLE = (bluetooth: Bluetooth, cb: (services: Services, bind: boolean) => void ) => {
    const [state, dispatch] = useDevicesState();

    const connectInto = (tag: string, device: BluetoothDevice) => {
        getServices(device).then((services) => {
            const entry = (s) => {
                cb(s, true);
            };
            dispatch({tag, type: Types.CONNECTED, services, entry,});
        }).catch((e) => {
            dispatch({tag, type: Types.ERROR, reason: e.message,});
        });
    };
    
    const request = async (tag: string) => {
        const entry = () => {
            console.log("entry()");
            requestMicrobit(bluetooth).then((device) => {
                if (device) {
                    device.addEventListener("gattserverdisconnected", (ev) => {
                        const entry = (s) => {
                            cb(s, false);
                        };
                        dispatch({tag, type: Types.DISCONNECTED, entry, });
                    });
                    const entry = (device: BluetoothDevice) => {
                        connectInto(tag, device);
                    };
                    dispatch({tag, type: Types.CONNECT, device, entry, });
                } else {
                    dispatch({tag, type: Types.REJECTED, reason: 'Returned undefined BluetoothDevice.',});
                }
            }).catch((e) => {
                dispatch({tag, type: Types.REJECTED, reason: e.message,});
            });
        };
        dispatch({tag, type: Types.REQUEST, entry, });
    };

    const connect = async (tag: string) => {
        const entry = (device: BluetoothDevice) => {
            connectInto(tag, device);
        };
        dispatch({tag, type: Types.CONNECT, entry, })
    }

    const disconnect = async (tag: string) => {
        const entry = (gatt: BluetoothRemoteGATTServer) => {
            gatt.disconnect();
        };
        dispatch({tag, type: Types.DISCONNECT, entry});
    }

    return {
        state,
        request,
        connect,
        disconnect,
    };
}
