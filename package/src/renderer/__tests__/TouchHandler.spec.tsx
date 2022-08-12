/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { TouchType } from "../../views/types";

import type { EmptyProps } from "./setup";
import { mountCanvas } from "./setup";

const CheckTouch = ({}: EmptyProps) => {
  const { useTouchHandler } = require("../../views/useTouchHandler");
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }: any) => {
      expect(x).toBe(10);
      expect(y).toBe(10);
    },
    onActive: ({ x, y, velocityX, velocityY }: any) => {
      expect(x).toBe(20);
      expect(y).toBe(20);
      expect(velocityX).toBe(10);
      expect(velocityY).toBe(10);
    },
  });
  touchHandler([
    [
      {
        x: 10,
        y: 10,
        force: 0,
        type: TouchType.Start,
        id: 0,
        timestamp: 0,
      },
    ],
    [
      {
        x: 20,
        y: 20,
        force: 0,
        type: TouchType.Active,
        id: 0,
        timestamp: 1,
      },
    ],
  ]);
  return null;
};

describe("Test handling of touch information", () => {
  it("Should check that the received values are correct", () => {
    const { draw } = mountCanvas(<CheckTouch />);
    draw();
  });
});
