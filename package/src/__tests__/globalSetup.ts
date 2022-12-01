import { WebSocketServer } from "ws";

const globalSetup = () => {
  return new Promise<void>((resolve) => {
    if (process.env.E2E !== "true") {
      resolve();
    } else {
      global.testServer = new WebSocketServer({ port: 4242 });
      global.testServer.on("connection", (client) => {
        global.testClient = client;
        resolve();
      });
    }
  });
};

// eslint-disable-next-line import/no-default-export
export default globalSetup;
