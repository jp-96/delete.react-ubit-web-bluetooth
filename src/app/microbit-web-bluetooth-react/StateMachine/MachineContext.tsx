import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth";

export type GattServerDisconnectedCallback = () => void;
export type DeviceBoundCallback = (device: BluetoothDevice, binding: boolean) => void;
export type ServicesBoundCallback = (services: Services, binding: boolean) => void;

// TODO: Reason: {type, message: string;}
export type Context = {
    conn: Connection;
    rejectedReason?: string;
    disconnectedReason?: string;
};

const defalutGattServerDisconnectedCallback: GattServerDisconnectedCallback = () => {
    console.log("missing GattServerDisconnectedCallback.");
};

export class Connection {

    constructor(bluetooth: Bluetooth = window.navigator.bluetooth) {
        this.bluetooth = bluetooth;
    }

    bluetooth: Bluetooth;

    private gattServerDisconnectedEventCallback: GattServerDisconnectedCallback = defalutGattServerDisconnectedCallback;

    private deviceCallbacks: DeviceBoundCallback[] = [];
    private device?: BluetoothDevice;

    private servicesCallbacks: ServicesBoundCallback[] = [];
    private services?: Services;

    public setGattServerDisconnectedCallback(cb?: GattServerDisconnectedCallback) {
        this.gattServerDisconnectedEventCallback = cb ?? defalutGattServerDisconnectedCallback;
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

    public addDeviceBoundCallback(cb: DeviceBoundCallback) {
        this.deviceCallbacks.push(cb);
        if (this.device) {
            cb(this.device, true);
        }
    }

    public removeDeviceBoundCallback(cb: DeviceBoundCallback) {
        this.deviceCallbacks = this.deviceCallbacks.filter(f => f !== cb);
    }

    private updateDeviceBoundCallbacksAll(device: BluetoothDevice, binding: boolean) {
        this.deviceCallbacks.map(f => f(device, binding));
    }

    private setDevice(device?: BluetoothDevice) {
        const gattserverdisconnected = "gattserverdisconnected";
        if (this.device) {
            // unbind
            this.updateDeviceBoundCallbacksAll(this.device, false);
            this.device.removeEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
        }
        this.device = device;
        if (this.device) {
            // bind
            this.device.addEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
            this.updateDeviceBoundCallbacksAll(this.device, true);
        }
    }

    public addServicesBoundCallback(cb: ServicesBoundCallback) {
        this.servicesCallbacks.push(cb);
        if (this.services) {
            cb(this.services, true);
        }
    }

    public removeServicesBoundCallback(cb: ServicesBoundCallback) {
        this.servicesCallbacks = this.servicesCallbacks.filter(f => f !== cb);
    }

    private updateServicesBoundCallbacksAll(services: Services, binding: boolean) {
        this.servicesCallbacks.map(f => f(services, binding));
    }

    private setServices(services?: Services) {
        if (this.services) {
            // unbind
            this.updateServicesBoundCallbacksAll(this.services, false);
        }
        this.services = services;
        if (this.services) {
            // bind
            this.updateServicesBoundCallbacksAll(this.services, true);
        }
    }

    public purge() {
        this.resetServices();
        this.resetDevice();
        this.setGattServerDisconnectedCallback()
        this.deviceCallbacks = [];
        this.servicesCallbacks = [];
    }

}
