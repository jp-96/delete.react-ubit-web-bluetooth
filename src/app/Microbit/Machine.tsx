import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate @xstate/react
import { getServices, requestMicrobit, Services } from "microbit-web-bluetooth"; // yarn add --dev microbit-web-bluetooth
import { Connection, Context } from "./MachineContext";

export const createMicrobitMachine = (bluetooth: Bluetooth, conn: Connection) => createMachine<Context>(
  // config
  {
    id: "mibrobit-bluetooth",
    context: { bluetooth, conn, }, // initial context
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
          src: (context) => (context as Context).conn.getServices(),
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
        context.conn.setDevice(device);
      },
      deassignMicrobitDevice: (context) => {
        // [old device] unbind
        context.conn.setDevice(undefined);
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
        context.conn.setServices(services);
      },
      deassignMicrobitServices: (context) => {
        // [old services] unbind
        context.conn.setServices(undefined);
      },
      gattDissconnect: (context: Context) => {
        context.conn.disconnectDeviceGatt();
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
