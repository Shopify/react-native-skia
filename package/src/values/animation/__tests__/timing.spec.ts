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
});
