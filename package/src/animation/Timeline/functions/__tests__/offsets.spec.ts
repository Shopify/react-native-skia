import type { TimelineInfo } from "../../types";
import { offsets } from "../offsets";

describe("offsets", () => {
  describe("Single", () => {
    it("should return offset zero when delay is zero", () => {
      const valueToTest = offsets(mockTimeline({ d: 100, delay: 0 }));
      expect(valueToTest._offset).toBe(0);
    });
    it("should return offset as delay when delay is set", () => {
      const valueToTest = offsets(mockTimeline({ d: 100, delay: 100 }));
      expect(valueToTest._offset).toBe(100);
    });
    it("should add parent offset to offset if provided", () => {
      const valueToTest = offsets(mockTimeline({ d: 100 }), 100);
      expect(valueToTest._offset).toBe(100);
    });
  });
  describe("With children", () => {
    it("should calculate offsets for child timelines", () => {
      const valueToTest = offsets(
        mockTimeline({
          d: 100,
          children: [
            mockTimeline({ d: 100, delay: 100 }),
            mockTimeline({ d: 100, delay: 200 }),
          ],
        })
      );
      expect(valueToTest._offset).toBe(0);
      expect(valueToTest.children[0]._offset).toBe(100);
      expect(valueToTest.children[1]._offset).toBe(200);
    });
  });
  describe("Automatic distribution", () => {
    it("should not distribute children when delay is set", () => {
      const valueToTest = offsets(
        mockTimeline({
          d: 0,
          children: [
            mockTimeline({ d: 100, delay: 0 }),
            mockTimeline({ d: 100, delay: 0 }),
            mockTimeline({ d: 100, delay: 0 }),
          ],
        })
      );
      expect(valueToTest.children[0]._offset).toBe(0);
      expect(valueToTest.children[1]._offset).toBe(0);
      expect(valueToTest.children[2]._offset).toBe(0);
    });
    it("should use delay when distributing children", () => {
      const valueToTest = offsets(
        mockTimeline({
          d: 0,
          children: [
            mockTimeline({ d: 100, delay: 100 }),
            mockTimeline({ d: 100, delay: 200 }),
            mockTimeline({ d: 100, delay: 300 }),
          ],
        })
      );
      expect(valueToTest.children[0]._offset).toBe(100);
      expect(valueToTest.children[1]._offset).toBe(200);
      expect(valueToTest.children[2]._offset).toBe(300);
    });
    it("should distribute children sequentially when delay is not set", () => {
      const valueToTest = offsets(
        mockTimeline({
          d: 0,
          children: [
            mockTimeline({ d: 100 }),
            mockTimeline({ d: 100 }),
            mockTimeline({ d: 100 }),
          ],
        })
      );
      expect(valueToTest.children[0]._offset).toBe(0);
      expect(valueToTest.children[1]._offset).toBe(100);
      expect(valueToTest.children[2]._offset).toBe(200);
    });
  });
});

function mockTimeline<T>(params: {
  d: number;
  repeat?: number;
  repeatDelay?: number;
  delay?: number;
  children?: TimelineInfo<T>[];
  offset?: number;
}) {
  const {
    d,
    repeat = 1,
    repeatDelay = 0,
    delay = undefined,
    children = [],
    offset = 0,
  } = params;
  return {
    duration: d,
    delay,
    repeat,
    repeatDelay,
    children: children,
    _offset: offset,
    _duration: 0,
    yoyo: false,
  };
}
