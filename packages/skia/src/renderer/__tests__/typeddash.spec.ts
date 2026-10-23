import { shallowEq } from "../typeddash";

describe("shallowEq", () => {
  it("holds for props whose every value is the same", () => {
    const paint = {};
    expect(
      shallowEq({ color: "red", cx: 1, paint }, { color: "red", cx: 1, paint })
    ).toBe(true);
  });

  it("fails for a value that differs", () => {
    expect(shallowEq({ cx: 1, r: 4 }, { cx: 1, r: 5 })).toBe(false);
  });

  it("fails for an object made again, however equal its contents", () => {
    expect(shallowEq({ points: [1, 2] }, { points: [1, 2] })).toBe(false);
  });

  it("skips children", () => {
    expect(shallowEq({ children: "a", r: 4 }, { children: "b", r: 4 })).toBe(
      true
    );
  });

  it("fails for a key only one side declares", () => {
    expect(shallowEq<object>({ r: 4 }, { cx: 1, r: 4 })).toBe(false);
    expect(shallowEq<object>({ cx: undefined, r: 4 }, { r: 4 })).toBe(false);
    expect(shallowEq<object>({ r: 4 }, { children: "a", r: 4 })).toBe(false);
  });
});
