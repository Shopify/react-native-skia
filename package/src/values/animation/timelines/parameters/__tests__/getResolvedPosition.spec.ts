import { getResolvedPosition } from "../getResolvedPosition";
import { addTimeline, createTimeline, getTimeline } from "../../functions";

describe("getResolvedPosition", () => {
  it("should return undefined when no position is provided", () => {
    const tl = createTimeline();
    const valueToTest = getResolvedPosition(tl, undefined);
    expect(valueToTest).toBeUndefined();
  });

  it("should return input number if position is set to number", () => {
    const tl = createTimeline();
    const valueToTest = getResolvedPosition(tl, 100);
    expect(valueToTest).toBe(100);
  });

  it("should return last item delay when position is set to '<'", () => {
    const tl = getTimeline(
      addTimeline(createTimeline(), createTimeline({ delay: 200 }))
    );
    const valueToTest = getResolvedPosition(tl, "<");
    expect(valueToTest).toBe(200);
  });

  it("should return 0 when position is set to '<' and only one item exists in parent", () => {
    const tl = createTimeline();
    const valueToTest = getResolvedPosition(tl, "<");
    expect(valueToTest).toBe(0);
  });

  it("should return last item offset + duration when position is set to '>'", () => {
    let tl = createTimeline();
    tl = getTimeline(
      addTimeline(tl, createTimeline({ delay: 200, duration: 100 }))
    );
    const valueToTest = getResolvedPosition(tl, ">");
    expect(valueToTest).toBe(300);
  });

  it("should return 0 when position is set to '>' and only one item exists in parent", () => {
    const tl = createTimeline();
    const valueToTest = getResolvedPosition(tl, ">");
    expect(valueToTest).toBe(0);
  });

  it("should return relative offset to last item when position is set to +=", () => {
    let tl = createTimeline();
    tl = getTimeline(
      addTimeline(tl, createTimeline({ delay: 1, duration: 1 }))
    );
    const valueToTest = getResolvedPosition(tl, "+=2");
    expect(valueToTest).toBe(4);
  });

  it("should return relative offset to last item when position is set to -=", () => {
    let tl = createTimeline();
    tl = getTimeline(
      addTimeline(tl, createTimeline({ delay: 1, duration: 3 }))
    );
    const valueToTest = getResolvedPosition(tl, "-=2");
    expect(valueToTest).toBe(2);
  });

  it("should throw an error if +/-= expression is not a number", () => {
    const t = () => {
      getResolvedPosition(createTimeline(), "-=hello");
    };
    expect(t).toThrow(Error);
  });

  it("should throw an error if position includes more than one equal sign", () => {
    const t = () => {
      getResolvedPosition(createTimeline(), "-=h=ello");
    };
    expect(t).toThrow(Error);
  });
});
