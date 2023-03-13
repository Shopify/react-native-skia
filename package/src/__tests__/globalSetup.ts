import { WebSocketServer } from "ws";

const isOS = (os: string): os is "android" | "ios" | "web" => {
  return ["ios", "android", "web"].indexOf(os) !== -1;
};

const globalSetup = () => {
  return new Promise<void>((resolve) => {
    if (process.env.E2E !== "true") {
      resolve();
    } else {
      global.testServer = new WebSocketServer({ port: 4242 });
      global.testServer.on("connection", (client) => {
        global.testClient = client;
        client.once("message", (msg) => {
          const str = msg.toString("utf8");
          const os = str.split("OS: ")[1];
          if (!isOS(os)) {
            throw new Error("Unknown testing platform: " + os);
          }
          global.testOS = os;
          resolve();
        });
      });
    }
  });
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
