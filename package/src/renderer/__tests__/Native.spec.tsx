import React from "react";
import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

import { Circle, Group } from "../components";

import { serialize, width, height, wait } from "./setup";

let server: Server;
let hl: WebSocket;

jest.setTimeout(30 * 1000);

beforeAll(() => {
  server = new WebSocketServer({ port: 4242 });
  return new Promise((resolve) => {
    server.on("connection", (con) => {
      hl = con;
      resolve(hl);
    });
  });
});

afterAll(() => {
  server.close();
});

describe("e2e Test", () => {
  it("Should blend colors using multiplication", async () => {
    const r = width * 0.33;
    const surface = serialize(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    hl.send(surface);
    hl.on("message", (data) => {
      console.log(data);
      console.log({ data });
    });
    await wait(30000);
    hl.close();
  });
});
