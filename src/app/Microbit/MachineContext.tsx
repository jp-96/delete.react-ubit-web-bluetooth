import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth";

export type GattServerDisconnectedEventCallback = () => void;
export type DeviceCallback = (device: BluetoothDevice, binding: boolean) => void;
export type ServicesCallback = (services: Services, binding: boolean) => void;

export type Context = {
    conn: Connection;
    rejectedReason?: string;
    disconnectedReason?: string;
};

const defalutGattServerDisconnectedEventCallback: GattServerDisconnectedEventCallback = () => {
    console.log("missing GattServerDisconnectedEventCallback.");
};

export class Connection {

    constructor (bluetooth: Bluetooth = window.navigator.bluetooth) {
        this.bluetooth = bluetooth;    
    }

    bluetooth: Bluetooth;

    private gattServerDisconnectedEventCallback: GattServerDisconnectedEventCallback = defalutGattServerDisconnectedEventCallback;
    
    private deviceCallbacks: DeviceCallback[] = [];
    private device?: BluetoothDevice;

    private servicesCallbacks: ServicesCallback[] = [];
    private services?: Services;

    public setGattServerDisconnectedEventCallback(cb?: GattServerDisconnectedEventCallback) {
        this.gattServerDisconnectedEventCallback = cb ?? defalutGattServerDisconnectedEventCallback;
    }

    public async requestDevice() {
        const device = await requestMicrobit(this.bluetooth);
        this.setDevice(device);
    }

    public resetDevice() {
        this.setDevice(undefined);
    }

    public async getServices() {
        const services = await getServices(this.device!);
        this.setServices(services);
    }

    public resetServices() {
        this.setServices(undefined);
    }

    public disconnectGattServer() {
        if (this.device && this.device.gatt && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        } else {
            console.log("missing Gatt Server connection.")
        }
    }

    public addDeviceCallback(cb: DeviceCallback) {
        this.deviceCallbacks.push(cb);
        if (this.device) {
            cb(this.device, true);
        }
    }

    public removeDeviceCallback(cb: DeviceCallback) {
        this.deviceCallbacks = this.deviceCallbacks.filter(f => f !== cb);
    }

    private updateDeviceCallbacksAll(device: BluetoothDevice, binding: boolean) {
        this.deviceCallbacks.map(f => f(device, binding));
    }
    
    private setDevice(device?: BluetoothDevice) {
        const gattserverdisconnected = "gattserverdisconnected";
        if (this.device) {
            // unbind
            this.updateDeviceCallbacksAll(this.device, false);
            this.device.removeEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
        }
        this.device = device;
        if (this.device) {
            // bind
            this.device.addEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
            this.updateDeviceCallbacksAll(this.device, true);
        }
    }

    public addServicesCallback(cb: ServicesCallback) {
        this.servicesCallbacks.push(cb);
        if (this.services) {
            cb(this.services, true);
        }
    }

    public removeServicesCallback(cb: ServicesCallback) {
        this.servicesCallbacks = this.servicesCallbacks.filter(f => f !== cb);
    }

    private updateServicesCallbacksAll(services: Services, binding: boolean) {
        this.servicesCallbacks.map(f => f(services, binding));
    }

    private setServices(services?: Services) {
        if (this.services) {
            // unbind
            this.updateServicesCallbacksAll(this.services, false);
        }
        this.services = services;
        if (this.services) {
            // bind
            this.updateServicesCallbacksAll(this.services, true);
        }
    }

    public purge() {
        this.resetServices();
        this.resetDevice();
        this.setGattServerDisconnectedEventCallback()
        this.deviceCallbacks = [];
        this.servicesCallbacks = [];
    }

}
