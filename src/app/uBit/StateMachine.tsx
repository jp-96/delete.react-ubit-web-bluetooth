import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate @xstate/react
import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth"; // yarn add --dev microbit-web-bluetooth

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
  disconnectedReason?: string;
  tag: string;
  cb: Callbacks;
};

export const createBluetoothMachine = (bluetooth: Bluetooth, tag: string = "") => createMachine<Context>(
  // config
  {
    id: "mibrobit-bluetooth",
    context: { bluetooth, tag, cb: {}, }, // initial context
    initial: "init", 
    states: {
      init: {
        on: {
          REQUEST: "request"
        }
      },
      request: {
        invoke: {
          id: "request-microbit",
          src: (context) => requestMicrobit((context as Context).bluetooth),
          onDone: {
            target: "waiting",
            actions: "assignMicrobitDevice"
          },
          onError: {
            target: "rejected",
            actions: "assignRejectedReason"
          }
        }
      },
      rejected: {
        exit: "deassignRejectedReason",
        on: {
          REQUEST: "request",
          RESET: "init"
        }
      },
      waiting: {
        invoke: {
          id: "get-services",
          src: (context) => getServices((context as Context).microbitDevice!),
          onDone: {
            target: "connected",
            actions: "assignMicrobitServices"
          },
          onError: {
            target: "disconnected",
            actions: "assignDisconnectedReason"
          }
        },
        on: {
          LOST: {
            target: "disconnected",
            actions: assign({
              disconnectedReason: "Delayed disconnection."
            }),
          }
        }
      },
      connected: {
        entry: "bindServices",
        exit: ["unbindServices", "deassignMicrobitServices"],
        on: {
          DISCONNECT: "disconnecting",
          LOST: {
            target: "disconnected",
            actions: assign({
              disconnectedReason: "GATT Server disconnect (by Peripheral)."
            }),
          }
        }
      },
      disconnecting: {
        entry: "gattDissconnect",
        on: {
          LOST: {
            target: "disconnected",
            actions: assign({
              disconnectedReason: "GATT Client disconnect (by Central)."
            }),
          }
        }
      },
      disconnected: {
        exit: [
          "deassignRejectedReason",
          "deassignDisconnectedReason"
        ],
        on: {
          CONNECT: "waiting",
          REQUEST: "subrequest",
          RESET: {
            target: "init",
            actions: "deassignMicrobitDevice"
          }
        }
      },
      subrequest: {
        invoke: {
          id: "request-microbit",
          src: (context) => requestMicrobit((context as Context).bluetooth),
          onDone: {
            target: "waiting",
            actions: ["deassignMicrobitDevice", "assignMicrobitDevice"]
          },
          onError: {
            target: "disconnected",
            actions: "assignRejectedReason"
          }
        }
      }
    }
  },
  // options: { actions }
  {
    actions: {
      assignMicrobitDevice: assign({
        microbitDevice: (context, event) => {
          // [new device] addEventListener and assign
          const device = (event as DoneInvokeEvent<BluetoothDevice>).data;
          device.addEventListener("gattserverdisconnected", () => {
            (context as Context).cb.sendDisconnect!();
          });
          return device;
        },
      }),
      deassignMicrobitDevice: assign({
        microbitDevice: (context) => {
          // [old device] removeEventListener and deassign
          const device = (context as Context).microbitDevice;
          device?.removeEventListener("gattserverdisconnected", null);
          return undefined;
        }
      }),
      assignRejectedReason: assign({
        rejectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignRejectedReason: assign({
        rejectedReason: undefined
      }),
      assignMicrobitServices: assign({
        microbitServices: (_, event) => (event as DoneInvokeEvent<Services>).data
      }),
      deassignMicrobitServices: assign({
        microbitServices: undefined
      }),
      gattDissconnect: (context: Context) => {
        context.microbitDevice?.gatt?.disconnect()
      },
      assignDisconnectedReason : assign({
        disconnectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignDisconnectedReason: assign({
        disconnectedReason: undefined
      }),
      bindServices: (context: Context) => {
        const bindServices = (context as Context).cb.bindServices;
        if (bindServices) {
          // binding - true: addEventListener
          bindServices((context as Context).microbitServices!, true);
        }
      },
      unbindServices: (context: Context) => {
        const bindServices = (context as Context).cb.bindServices;
        if (bindServices) {
          // binding - false: removeEventListener
          bindServices((context as Context).microbitServices!, false);
        }
      }
    }
  }
);
