import { timing } from "../timing";

const state = { current: 0, finished: false };

describe("timing", () => {
  it("should return zero when the timestamp is zero", () => {
    expect(timing(0, 1000, (t) => t, false, false, state).current).toBe(0);
  });

  it("should return 1 when the timestamp is over duration", () => {
    expect(timing(2000, 1000, (t) => t, false, false, state).current).toBe(1);
  });

  it("should return 0 when yoyo/loop is true and t is duration times 2", () => {
    expect(timing(2000, 1000, (t) => t, true, true, state).current).toBe(0);
  });

  it("should return 1.0 when t = duration when looping and yoyo ", () => {
    expect(timing(700, 700, (t) => t, true, true, state).current).toBe(1);
  });

  it("should return 0 when t = duration when looping and not yoyo ", () => {
    expect(timing(700, 700, (t) => t, true, false, state).current).toBe(0);
  });

  it("should stop when duration is reached", () => {
    expect(timing(700, 700, (t) => t, false, false, state).finished).toBe(true);
  });
});
