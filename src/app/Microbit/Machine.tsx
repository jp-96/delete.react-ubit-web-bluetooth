import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate
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
          id: "request-device",
          src: "invokeRequestDevice",
          onDone: {
            target: "waiting",
          },
          onError: {
            target: "rejected",
            actions: "assignRejectedReasonOnError"
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
          src: "invokeGetServices",
          onDone: {
            target: "connected"
          },
          onError: {
            target: "disconnected",
            actions: "assignDisconnectedReasonOnError"
          }
        },
        on: {
          LOST: {
            target: "disconnected",
            actions: "assignDisconnectedReasonByDelayed"
          }
        }
      },
      connected: {
        on: {
          DISCONNECT: "disconnecting",
          LOST: {
            target: "disconnected",
            actions: "assignDisconnectedReasonByPeripheral"
          }
        },
        exit: "callResetServices"
      },
      disconnecting: {
        entry: "callDisconnectGattServer",
        on: {
          LOST: {
            target: "disconnected",
            actions: "assignDisconnectedReasonByCentral"
          }
        }
      },
      disconnected: {
        on: {
          CONNECT: "waiting",
          REQUEST: "subrequest",
          RESET: {
            target: "init",
            actions: "callResetDevice"
          }
        },
        exit: [
          "deassignRejectedReason",
          "deassignDisconnectedReason"
        ]
      },
      subrequest: {
        invoke: {
          id: "sub-request-device",
          src: "invokeRequestDevice",
          onDone: {
            target: "waiting"
          },
          onError: {
            target: "disconnected",
            actions: "assignRejectedReasonOnError"
          }
        }
      }
    }
  },
  // options: { actions, services }
  {
    actions: {
      deassignRejectedReason: assign({
        rejectedReason: undefined
      }),
      assignRejectedReasonOnError: assign({
        rejectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      deassignDisconnectedReason: assign({
        disconnectedReason: undefined
      }),
      assignDisconnectedReasonOnError: assign({
        disconnectedReason: (_, event) => (event as DoneInvokeEvent<Error>).data.message
      }),
      assignDisconnectedReasonByDelayed: assign({
        disconnectedReason: "Delayed disconnection."
      }),
      assignDisconnectedReasonByPeripheral: assign({
        disconnectedReason: "Disconnected by Peripheral."
      }),
      assignDisconnectedReasonByCentral: assign({
        disconnectedReason: "Disconnected by Central."
      }),
      callResetDevice: context => context.conn.resetDevice(),
      callResetServices: context => context.conn.resetServices(),
      callDisconnectGattServer: context => context.conn.disconnectGattServer()
    },
    services: {
      invokeRequestDevice: (context) => context.conn.requestDevice(),
      invokeGetServices: context => context.conn.getServices(),
    }
  }
);
