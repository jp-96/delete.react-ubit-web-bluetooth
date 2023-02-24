import { getServices, Services } from "microbit-web-bluetooth";

export type GattServerDisconnectedCallback = () => void;
type DeviceCallback = (device: BluetoothDevice, binding: boolean) => void;
type ServicesCallback = (services: Services, binding: boolean) => void;

export default class MicrobitConnection {
    private gattServerDisconnected?: GattServerDisconnectedCallback;
    
    private deviceCallbacks: DeviceCallback[] = [];
    private device?: BluetoothDevice;

    private servicesCallbacks: ServicesCallback[] = [];
    private services?: Services;

    public setGattServerDisconnectedCallback(cb?: GattServerDisconnectedCallback) {
        console.log("setGattServerDisconnectedCallback()", cb);
        this.gattServerDisconnected = cb;
    }

    public async getServices() {
        return await getServices(this.device!);
    }

    public disconnectDeviceGatt() {
        this.device?.gatt?.disconnect();
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
    
    public setDevice(device?: BluetoothDevice) {
        if (this.device) {
            // unbind
            this.updateDeviceCallbacksAll(this.device, false);
            this.device.removeEventListener("gattserverdisconnected", this.gattServerDisconnected!);
        }
        this.device = device;
        if (this.device) {
            // bind
            this.device.addEventListener("gattserverdisconnected", this.gattServerDisconnected!);
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

    public setServices(services?: Services) {
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
        this.setServices();
        this.setDevice();
        this.setGattServerDisconnectedCallback()
        this.deviceCallbacks = [];
        this.servicesCallbacks = [];
    }

}
