import React from "react";
import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

import { processResult } from "../../__tests__/setup";
import { Circle, Group } from "../components";

import { drawOnNode, width, height, wait } from "./setup";

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
  it("Should blend colors using multiplication", () => {
    hl.send("start");
    hl.on("message", (data) => {
      console.log({ data });
    });
    wait(3000);
    const r = width * 0.33;
    const surface = drawOnNode(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    processResult(surface, "snapshots/drawings/blend-mode-multiply.png");
  });
});
