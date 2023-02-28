import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth";

export type GattServerDisconnectedCallback = () => void;

type Bound<T> = { target: T, binding: boolean };
export type BoundCallback<T> = (bound: Bound<T>) => void;
export type ServiceBoundCallback<T> = BoundCallback<T>;

type Reason<T> = { type: T, message: string; };

export type RejectedReason = Reason<"NONE" | "ERROR">;
export type DisconnectedReason = Reason<"NONE" | "ERROR" | "DELAYED" | "PERIPHERAL" | "CENTRAL">;

export type Context = {
    conn: Connection;
    rejectedReason: RejectedReason;
    disconnectedReason: DisconnectedReason;
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

    private deviceCallbacks: BoundCallback<BluetoothDevice>[] = [];
    private device?: BluetoothDevice;

    private servicesCallbacks: BoundCallback<Services>[] = [];
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

    public addDeviceBoundCallback(cb: BoundCallback<BluetoothDevice>) {
        this.deviceCallbacks.push(cb);
        if (this.device) {
            cb({ target: this.device, binding: true });
        }
    }

    public removeDeviceBoundCallback(cb: BoundCallback<BluetoothDevice>) {
        this.deviceCallbacks = this.deviceCallbacks.filter(f => f !== cb);
    }

    private updateDeviceBoundCallbacksAll(bound: Bound<BluetoothDevice>) {
        this.deviceCallbacks.map(f => f(bound));
    }

    private setDevice(device?: BluetoothDevice) {
        const gattserverdisconnected = "gattserverdisconnected";
        if (this.device) {
            // unbind
            this.updateDeviceBoundCallbacksAll({ target: this.device, binding: false });
            this.device.removeEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
        }
        this.device = device;
        if (this.device) {
            // bind
            this.device.addEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
            this.updateDeviceBoundCallbacksAll({ target: this.device, binding: true });
        }
    }

    public addServicesBoundCallback(cb: BoundCallback<Services>) {
        this.servicesCallbacks.push(cb);
        if (this.services) {
            cb({ target: this.services, binding: true });
        }
    }

    public removeServicesBoundCallback(cb: BoundCallback<Services>) {
        this.servicesCallbacks = this.servicesCallbacks.filter(f => f !== cb);
    }

    private updateServicesBoundCallbacksAll(bound: Bound<Services>) {
        this.servicesCallbacks.map(f => f(bound));
    }

    private setServices(services?: Services) {
        if (this.services) {
            // unbind
            this.updateServicesBoundCallbacksAll({ target: this.services, binding: false });
        }
        this.services = services;
        if (this.services) {
            // bind
            this.updateServicesBoundCallbacksAll({ target: this.services, binding: true });
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
