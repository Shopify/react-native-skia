import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

declare global {
  var testServer: Server;
  var testClient: WebSocket;
  var testOS: "ios" | "android" | "web" | "node";
  var testArch: "paper" | "fabric";
  var testClientHealthy: boolean;
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
      global.testServer = new WebSocketServer({ port });
      console.log(
        `\n\nTest server listening on port ${port} (waiting for the example app to open on E2E tests screen)`
      );
      global.testServer.on("connection", (client) => {
        global.testClient = client;
        global.testClientHealthy = true;
        
        let missedPongs = 0;
        const maxMissedPongs = 2;
        
        // Set up heartbeat
        const heartbeat = setInterval(() => {
          if (client.readyState === client.OPEN) {
            if (missedPongs >= maxMissedPongs) {
              console.log('Client appears unhealthy, terminating connection');
              global.testClientHealthy = false;
              client.terminate();
              clearInterval(heartbeat);
              return;
            }
            missedPongs++;
            client.ping();
          } else {
            clearInterval(heartbeat);
          }
        }, 30000);
        
        client.on('pong', () => {
          console.log('Heartbeat received from client');
          missedPongs = 0;
          global.testClientHealthy = true;
        });
        
        client.on('close', () => {
          clearInterval(heartbeat);
          global.testClientHealthy = false;
          console.log('Client disconnected');
        });
        
        client.once("message", (msg) => {
          const obj = JSON.parse(msg.toString("utf8"));
          const { OS, arch } = obj;
          if (!isOS(OS)) {
            throw new Error("Unknown testing platform: " + OS);
          }
          if (!isArch(arch)) {
            throw new Error("Unknown testing architecture: " + arch);
          }
          global.testOS = OS;
          global.testArch = arch;
          console.log(`${OS} device connected (${arch})`);
          resolve();
        });
      });
    }
  });
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
