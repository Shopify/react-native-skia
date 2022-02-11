import { timing } from "../timing";

describe("timing", () => {
  it("should return zero when the timestamp is zero", () => {
    expect(
      timing(
        0,
        1000,
        (t) => t,
        false,
        false,
        () => {}
      )
    ).toBe(0);
  });

  it("should return 1 when the timestamp is over duration", () => {
    expect(
      timing(
        2000,
        1000,
        (t) => t,
        false,
        false,
        () => {}
      )
    ).toBe(1);
  });

  it("should return 0 when yoyo/loop is true and t is duration times 2", () => {
    expect(
      timing(
        2000,
        1000,
        (t) => t,
        true,
        true,
        () => {}
      )
    ).toBe(0);
  });

  it("should return 1.0 when t = duration when looping and yoyo ", () => {
    expect(tm(700, 700, true, true)).toBe(1);
  });

  it("should return 0 when t = duration when looping and not yoyo ", () => {
    expect(tm(700, 700, true, false)).toBe(0);
  });
});

const tm = (t: number, duration: number, loop: boolean, yoyo: boolean) =>
  timing(
    t,
    duration,
    (te) => te,
    loop,
    yoyo,
    () => {}
  );
