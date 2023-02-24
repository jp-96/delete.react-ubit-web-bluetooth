import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate @xstate/react
import { Services } from "microbit-web-bluetooth"; // yarn add --dev microbit-web-bluetooth
import { Connection, Context } from "./MachineContext";

export const createMicrobitMachine = (conn: Connection) => createMachine<Context>(
  // config
  {
    id: "mibrobit-bluetooth",
    context: { conn, }, // initial context
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
          src: (context) => context.conn.requestDevice(),
          onDone: {
            target: "waiting",
          },
          onError: {
            target: "rejected",
            actions: "assignRejectedReason"
          }
        }
      },
      rejected: {
        on: {
          REQUEST: "request",
          RESET: "init"
        },
        exit: "deassignRejectedReason"
      },
      waiting: {
        invoke: {
          id: "get-services",
          src: context => context.conn.getServices(),
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
        on: {
          DISCONNECT: "disconnecting",
          LOST: {
            target: "disconnected",
            actions: assign({
              disconnectedReason: "GATT Server disconnect (by Peripheral)."
            }),
          }
        },
        exit: "deassignMicrobitServices"
      },
      disconnecting: {
        entry: context => context.conn.disconnectDeviceGatt(),
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
        on: {
          CONNECT: "waiting",
          REQUEST: "subrequest",
          RESET: {
            target: "init",
            actions: context => context.conn.resetDevice()
          }
        },
        exit: [
          "deassignRejectedReason",
          "deassignDisconnectedReason"
        ]
      },
      subrequest: {
        invoke: {
          id: "request-microbit",
          src: (context) => context.conn.requestDevice(),
          onDone: {
            target: "waiting"
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
      assignRejectedReason: assign({
        rejectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignRejectedReason: assign({
        rejectedReason: undefined
      }),
      assignDisconnectedReason : assign({
        disconnectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignDisconnectedReason: assign({
        disconnectedReason: undefined
      }),
      assignMicrobitServices: (context, event) => {
        // [new services] bind
        const services = (event as DoneInvokeEvent<Services>).data;
        context.conn.setServices(services);
      },
      deassignMicrobitServices: (context) => {
        // [old services] unbind
        context.conn.setServices(undefined);
      }
    }
  }
);
