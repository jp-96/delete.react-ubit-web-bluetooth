import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth";

export type GattServerDisconnectedCallback = () => void;

const defalutGattServerDisconnectedCallback: GattServerDisconnectedCallback = () => {
    console.log("missing GattServerDisconnectedCallback.");
};

type Bound<T> = { target: T, binding: boolean };
export type BoundCallback<T> = (bound: Bound<T>) => void;

export class Connection {

    constructor(bluetooth: Bluetooth = window.navigator.bluetooth, name: string = "micro:bit") {
        this.bluetooth = bluetooth;
        this.name = name;
    }

    private bluetooth: Bluetooth;
    public name: string;

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
        this.setServices(undefined);
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
        if (this.device && this.device.gatt /*&& this.device.gatt.connected*/) {
            if (!this.device.gatt.connected) {
                console.log("Gatt Server has already been disconnected.")
            }
            this.device.gatt.disconnect();
        } else {
            console.log("missing Gatt Server connection.")
        }
    }

    public addDeviceBoundCallback(cb: BoundCallback<BluetoothDevice>) {
        this.deviceCallbacks.push(cb);
        if (this.device) {
            cb({ target: this.device, binding: true }); // bind
        }
    }

    public removeDeviceBoundCallback(cb: BoundCallback<BluetoothDevice>) {
        this.deviceCallbacks = this.deviceCallbacks.filter(f => {
            if (f === cb) {
                if (this.device) {
                    cb({ target: this.device, binding: false }); // unbind
                }
                return false;
            }
            return true;
        });
    }

    private updateDeviceBoundCallbacksAll(binding: boolean): boolean {
        const target = this.device;
        if (target) {
            const bound: Bound<BluetoothDevice> = { target, binding }
            this.deviceCallbacks.forEach(f => f(bound)); // binding
            return true;
        }
        return false;
    }

    private setDevice(device?: BluetoothDevice) {
        const gattserverdisconnected = "gattserverdisconnected";
        this.updateDeviceBoundCallbacksAll(false); // unbind all
        if (this.device) {
            this.device.removeEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
        }
        this.device = device; // change
        if (this.device) {
            this.device.addEventListener(gattserverdisconnected, this.gattServerDisconnectedEventCallback);
        }
        this.updateDeviceBoundCallbacksAll(true); // bind all
    }

    public addServicesBoundCallback(cb: BoundCallback<Services>) {
        this.servicesCallbacks.push(cb);
        if (this.services) {
            cb({ target: this.services, binding: true }); //bind
        }
    }

    public removeServicesBoundCallback(cb: BoundCallback<Services>) {
        this.servicesCallbacks = this.servicesCallbacks.filter(f => {
            if (f === cb) {
                if (this.services) {
                    f({ target: this.services, binding: false }); // unbind
                }
                return false;
            }
            return true;
        });
    }

    private updateServicesBoundCallbacksAll(binding: boolean) {
        const target = this.services;
        if (target) {
            const bound: Bound<Services> = { target, binding };
            this.servicesCallbacks.forEach(f => f(bound));
        }
        return false;
    }

    private setServices(services?: Services) {
        this.updateServicesBoundCallbacksAll(false); // unbind all
        this.services = services; // change
        this.updateServicesBoundCallbacksAll(true); // bind all
    }

    public purge() {
        this.resetServices();
        this.resetDevice();
        this.setGattServerDisconnectedCallback()
        this.deviceCallbacks = [];
        this.servicesCallbacks = [];
    }

}

type Reason<T> = { type: T, message: string; };

export type RejectedReason = Reason<"NONE" | "ERROR">;
export type DisconnectedReason = Reason<"NONE" | "ERROR" | "DELAYED" | "PERIPHERAL" | "CENTRAL">;

export type Context = {
    conn: Connection;
    rejectedReason: RejectedReason;
    disconnectedReason: DisconnectedReason;
};
