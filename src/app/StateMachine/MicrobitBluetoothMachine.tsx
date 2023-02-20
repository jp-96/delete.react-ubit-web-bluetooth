import { Machine, assign, DoneInvokeEvent } from "xstate";
import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth";

export type SendDisconnectCallback = () => void;

export type BindServicesCallback = (services: Services, binding: boolean) => void;

type Callbacks = {
  sendDisconnect?: SendDisconnectCallback;
  bindServices?: BindServicesCallback;
};

export type Context = {
  bluetooth: Bluetooth;
  microbitDevice?: BluetoothDevice;
  microbitServices?: Services;
  rejectedReason?: string;
  errorReason?: string;
  tag: string;
  cb: Callbacks;
};

export const createMicrobitBluetoothMachine = (bluetooth: Bluetooth, tag: string = "") => Machine<Context>(
  // config
  {
    id: "mibrobit-bluetooth",
    initial: "init",
    states: {
      init: {
        entry: "deassignMicrobitDevice", // actions
        on: {
          REQUEST: "request"
        }
      },
      request: {
        invoke: {
          id: "request-microbit",
          src: (context) => requestMicrobit((context as Context).bluetooth),
          onDone: {
            target: "connect",
            actions: "assignMicrobitDevice" // actions
          },
          onError: {
            target: "rejected",
            actions: "assignRejectedReason" // actions
          }
        }
      },
      rejected: {
        exit: "deassignRejectedReason", // actions
        on: {
          REQUEST: "request",
          RESET: "init"
        }
      },
      connect: {
        invoke: {
          id: "get-services",
          src: (context) => getServices((context as Context).microbitDevice!),
          onDone: {
            target: "connected",
            actions: "assignMicrobitServices" // actions
          },
          onError: {
            target: "disconnected",
            actions: "assignConnectErrorReason" // actions
          }
        },
        on: {
          DISCONNECTED: "disconnected"
        }
      },
      connected: {
        entry: "callbackServicesBind", // actions
        exit: "callbackServicesUnbind", // actions
        on: {
          DISCONNECT: "disconnect",
          DISCONNECTED: "disconnected"
        }
      },
      disconnect: {
        entry: "gattDissconnect", // actions
        on: {
          DISCONNECTED: "disconnected"
        }
      },
      disconnected: {
        exit: [
          "deassignRejectedReason", // actions
          "deassignErrorReason" // actions
        ],
        on: {
          CONNECT: "connect",
          REQUEST: "request",
          RESET: "init"
        }
      }
    }
  },
  // options
  {
    actions: {
      assignMicrobitDevice: assign({
        microbitDevice: (context, event) => {
          console.log("assignMicrobitDevice:", JSON.stringify(event));
          const device: BluetoothDevice = (event as DoneInvokeEvent<
            BluetoothDevice
          >).data;
          const sendDisconnect = (context as Context).cb.sendDisconnect;
          if (sendDisconnect) {
            device.addEventListener("gattserverdisconnected", () => {
              sendDisconnect();
            });
          }
          return device;
        }
      }),
      deassignMicrobitDevice: assign({
        microbitDevice: () => undefined
      }),
      assignRejectedReason: assign({
        rejectedReason: (_, event) =>
          // (context, event) => { return event.data }
          (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignRejectedReason: assign({
        rejectedReason: () => undefined
      }),
      assignMicrobitServices: assign({
        microbitServices: (_, event) =>
          (event as DoneInvokeEvent<Services>).data
      }),
      deassignMicrobitServices: assign({
        microbitServices: () => undefined
      }),
      assignErrorReason: assign({
        errorReason: (_, event) =>
          // (context, event) => { return event.data }
          (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignErrorReason: assign({
        errorReason: (_, event) => undefined
      }),
      gattDissconnect: (context: Context) => {
        context.microbitDevice?.gatt?.disconnect();
      },
      callbackServicesBind: (context: Context) => {
        const bindServices = (context as Context).cb.bindServices;
        if (bindServices) {
          bindServices((context as Context).microbitServices!, true);
        }
      },
      callbackServicesUnbind: (context: Context) => {
        const bindServices = (context as Context).cb.bindServices;
        if (bindServices) {
          bindServices((context as Context).microbitServices!, false);
        }
      }
    }
  },
  // initial context
  {
    bluetooth, 
    tag,
    cb: {},
  }
);
