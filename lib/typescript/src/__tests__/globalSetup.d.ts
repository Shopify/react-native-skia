import type { Server, WebSocket } from "ws";
declare global {
    var testServer: Server;
    var testClient: WebSocket;
    var testOS: "ios" | "android" | "web" | "node";
    var testArch: "paper" | "fabric";
}
declare const globalSetup: () => Promise<void>;
export default globalSetup;
