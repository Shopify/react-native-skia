import { Server } from "socket.io";
import type { Socket } from "socket.io";

declare global {
  var testServer: Server;
  var testClient: Socket;
  var testOS: "ios" | "android" | "web" | "node";
  var testArch: "paper" | "fabric";
}

const isOS = (os: string): os is "android" | "ios" | "web" => {
  return ["ios", "android", "web"].indexOf(os) !== -1;
};

const isArch = (arc: string): arc is "paper" | "fabric" => {
  return ["paper", "fabric"].indexOf(arc) !== -1;
};

const globalSetup = () => {
  return new Promise<void>((resolve) => {
    if (process.env.E2E !== "true") {
      resolve();
    } else {
      const port = 4242;
      global.testServer = new Server(port, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling']
      });
      
      console.log(
        `\n\nTest server listening on port ${port} (waiting for the example app to open on E2E tests screen)`
      );
      
      global.testServer.on("connection", (socket) => {
        console.log("Socket.IO client connected");
        global.testClient = socket;
        
        // Handle initial handshake
        socket.once("handshake", (data) => {
          const { OS, arch } = data;
          if (!isOS(OS)) {
            throw new Error("Unknown testing platform: " + OS);
          }
          if (!isArch(arch)) {
            throw new Error("Unknown testing architecture: " + arch);
          }
          global.testOS = OS;
          global.testArch = arch;
          console.log(`${OS} device connected (${arch})`);
          socket.emit("handshake-ack", { success: true });
          resolve();
        });

        socket.on("disconnect", (reason) => {
          console.log("Socket.IO client disconnected:", reason);
        });

        socket.on("error", (error) => {
          console.error("Socket.IO error:", error);
        });
      });
    }
  });
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
