import { assign, createMachine, DoneInvokeEvent } from "xstate"; // yarn add --dev xstate
import { Connection, Context, DisconnectedReason, RejectedReason } from "./Context";

const rejectedReason: RejectedReason = { type: "NONE", message: "" };
const disconnectedReason: DisconnectedReason = { type: "NONE", message: "" };

export const createContext = (conn: Connection) => ({ conn, rejectedReason, disconnectedReason });

export const machineWithoutContext = createMachine<Context>(
  // config
  {
    predictableActionArguments: true, // see: https://xstate.js.org/docs/guides/actions.html#actions
    id: "microbit-bluetooth",
    // Without context, so "machineWithoutContext.withContext()" must be called. 
    initial: "init",
    invoke: {
      id: "setup-cleanup-callback",
      src: "invokeSetGattServerDisconnectedCallback"
    },
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
        rejectedReason
      }),
      assignRejectedReasonOnError: assign({
        rejectedReason: (_, event) => { return { type: "ERROR", message: (event as DoneInvokeEvent<Error>).data.message }; }
      }),
      deassignDisconnectedReason: assign({
        disconnectedReason
      }),
      assignDisconnectedReasonOnError: assign({
        disconnectedReason: (_, event) => { return { type: "ERROR", message: (event as DoneInvokeEvent<Error>).data.message }; }
      }),
      assignDisconnectedReasonByDelayed: assign({
        disconnectedReason: { type: "DELAYED", message: "Delayed disconnection." }
      }),
      assignDisconnectedReasonByPeripheral: assign({
        disconnectedReason: { type: "PERIPHERAL", message: "Disconnected by Peripheral." }
      }),
      assignDisconnectedReasonByCentral: assign({
        disconnectedReason: { type: "CENTRAL", message: "Disconnected by Central." }
      }),
      callResetDevice: context => context.conn.resetDevice(),
      callResetServices: context => context.conn.resetServices(),
      callDisconnectGattServer: context => context.conn.disconnectGattServer()
    },
    services: {
      invokeRequestDevice: context => context.conn.requestDevice(),
      invokeGetServices: context => context.conn.getServices(),
      invokeSetGattServerDisconnectedCallback: context => callback => {
        context.conn.setGattServerDisconnectedCallback(() => callback("LOST"));
        // Perform cleanup
        return () => {
          context.conn.setGattServerDisconnectedCallback(undefined);
        };
      }
    }
  }
);
