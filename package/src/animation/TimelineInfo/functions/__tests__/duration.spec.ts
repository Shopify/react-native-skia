import type { TimelineInfo } from "../../types";
import { duration } from "../duration";

describe("duration", () => {
  describe("Single timeline", () => {
    it("should return duration if no other parameter is set.", () => {
      const valueToTest = duration(mockTimeline({ d: 100 }));
      expect(valueToTest).toBe(100);
    });
    it("should return duration with repeat", () => {
      const valueToTest = duration(mockTimeline({ d: 100, repeat: 2 }));
      expect(valueToTest).toBe(200);
    });
    it("should return duration with repeat and repeat delay", () => {
      const valueToTest = duration(
        mockTimeline({ d: 100, repeat: 4, repeatDelay: 100 })
      );
      expect(valueToTest).toBe(700);
    });
    it("should return duration and ignore repeat delay when repeat is 1", () => {
      const valueToTest = duration(
        mockTimeline({ d: 100, repeat: 1, repeatDelay: 1000 })
      );
      expect(valueToTest).toBe(100);
    });
    it("should ignore delay when returning duration", () => {
      const valueToTest = duration(mockTimeline({ d: 100, delay: 500 }));
      expect(valueToTest).toBe(100);
    });
  });
  describe("With children and without offsets", () => {
    it("should return duration from children when self duration is zero", () => {
      const valueToTest = duration(
        mockTimeline({
          d: 0,
          children: [mockTimeline({ d: 100 }), mockTimeline({ d: 200 })],
        })
      );
      expect(valueToTest).toBe(200);
    });
    it("should return duration from self when child duration is less than self duration", () => {
      const valueToTest = duration(
        mockTimeline({
          d: 100,
          children: [mockTimeline({ d: 50 }), mockTimeline({ d: 50 })],
        })
      );
      expect(valueToTest).toBe(100);
    });
  });
  describe("With children and offsets", () => {
    it("should include offsets when calculating duration for one children", () => {
      const valueToTest = duration(
        mockTimeline({
          d: 0,
          children: [mockTimeline({ d: 100, offset: 100 })],
        })
      );
      expect(valueToTest).toBe(200);
    });
    it("should include offsets when calculating duration for multiple children", () => {
      const valueToTest = duration(
        mockTimeline({
          d: 0,
          children: [
            mockTimeline({ d: 100, offset: 100 }),
            mockTimeline({ d: 100, offset: 300 }),
            mockTimeline({ d: 100, offset: 200 }),
          ],
        })
      );
      expect(valueToTest).toBe(400);
    });
  });
});

function mockTimeline(params: {
  d: number;
  repeat?: number;
  repeatDelay?: number;
  delay?: number;
  children?: TimelineInfo<Record<string, unknown>>[];
  offset?: number;
}) {
  const {
    d,
    repeat = 1,
    repeatDelay = 0,
    delay = 0,
    children = [],
    offset = 0,
  } = params;
  return {
    duration: d,
    delay,
    repeat,
    repeatDelay,
    children: children,
    yoyo: false,
    _offset: offset,
    _duration: 0,
  };
}
