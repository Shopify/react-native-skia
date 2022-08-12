/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import type { TouchInfo } from "../../views/types";
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
    onEnd: ({ x, y, velocityX, velocityY }: any) => {
      expect(x).toBe(30);
      expect(y).toBe(30);
      expect(velocityX).toBe(10);
      expect(velocityY).toBe(10);
    },
  });
  const history: TouchInfo[][] = [
    [
      {
        x: 10,
        y: 10,
        force: 0,
        type: TouchType.Start,
        id: 2,
        timestamp: 0,
      },
    ],
    [
      {
        x: 20,
        y: 20,
        force: 0,
        type: TouchType.Active,
        id: 2,
        timestamp: 1,
      },
    ],
    [
      {
        x: 30,
        y: 30,
        force: 0,
        type: TouchType.End,
        id: 2,
        timestamp: 2,
      },
    ],
  ];
  touchHandler(history);
  return null;
};

describe("Test handling of touch information", () => {
  it("Should check that the received values are correct", () => {
    const { draw } = mountCanvas(<CheckTouch />);
    draw();
  });
});
