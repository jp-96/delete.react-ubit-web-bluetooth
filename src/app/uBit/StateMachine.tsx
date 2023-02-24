import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate @xstate/react
import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth"; // yarn add --dev microbit-web-bluetooth
import MicrobitConnection from "./MicrobitConnection";

export type Context = {
  bluetooth: Bluetooth;
  microbit: MicrobitConnection;
  rejectedReason?: string;
  disconnectedReason?: string;
};

export const createBluetoothMachine = (bluetooth: Bluetooth, microbit: MicrobitConnection) => createMachine<Context>(
  // config
  {
    id: "mibrobit-bluetooth",
    context: { bluetooth, microbit, }, // initial context
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
          src: (context) => (context as Context).microbit.getServices(),
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
        exit: "deassignMicrobitServices",
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
      assignMicrobitDevice: (context, event) => {
        // [new device] bind
        const device = (event as DoneInvokeEvent<BluetoothDevice>).data;
        context.microbit.setDevice(device);
      },
      deassignMicrobitDevice: (context) => {
        // [old device] unbind
        context.microbit.setDevice(undefined);
      },
      assignRejectedReason: assign({
        rejectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignRejectedReason: assign({
        rejectedReason: undefined
      }),
      assignMicrobitServices: (context, event) => {
        // [new services] bind
        const services = (event as DoneInvokeEvent<Services>).data;
        context.microbit.setServices(services);
      },
      deassignMicrobitServices: (context) => {
        // [old services] unbind
        context.microbit.setServices(undefined);
      },
      gattDissconnect: (context: Context) => {
        context.microbit.disconnectDeviceGatt();
      },
      assignDisconnectedReason : assign({
        disconnectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignDisconnectedReason: assign({
        disconnectedReason: undefined
      })
    }
  }
);
