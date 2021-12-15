import { distribute } from "../distribute";

describe("distribute", () => {
  it("should return a stagger using each when param is a number", () => {
    const valueToTest = distribute(1);
    expect(valueToTest(4, 0, new Array(5).fill(0))).toBe(4);
  });

  it("should add delay as index * each when each is set as parameter", () => {
    const valueToTest = distribute({ each: 1 });
    expect(valueToTest(4, 0, new Array(5).fill(0))).toBe(4);
  });

  it("should distribute delays when parameter contains amount", () => {
    const valueToTest = distribute({ amount: 6 });
    const arr = new Array(3).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(0);
    expect(valueToTest(1, 0, arr)).toBe(3);
    expect(valueToTest(2, 0, arr)).toBe(6);
  });

  it("should enum children from 0..n when parameter from is start", () => {
    const valueToTest = distribute({ each: 1, from: "start" });
    const arr = new Array(3).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(0);
    expect(valueToTest(1, 0, arr)).toBe(1);
    expect(valueToTest(2, 0, arr)).toBe(2);
  });

  it("should enum children from n..0 when parameter from is end", () => {
    const valueToTest = distribute({ each: 1, from: "end" });
    const arr = new Array(3).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(2);
    expect(valueToTest(1, 0, arr)).toBe(1);
    expect(valueToTest(2, 0, arr)).toBe(0);
  });

  it("should enum children from center and out when parameter from is center", () => {
    const valueToTest = distribute({ each: 1, from: "center" });
    const arr = new Array(3).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(2);
    expect(valueToTest(1, 0, arr)).toBe(0);
    expect(valueToTest(2, 0, arr)).toBe(2);
  });

  it("should enum children from edges and in when parameter from is edges", () => {
    const valueToTest = distribute({ each: 1, from: "edges" });
    const arr = new Array(3).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(0);
    expect(valueToTest(1, 0, arr)).toBe(2);
    expect(valueToTest(2, 0, arr)).toBe(0);
  });

  it("should enum children from index and out when parameter from is numeric", () => {
    const valueToTest = distribute({ each: 1, from: 3 });
    const arr = new Array(5).fill(0);
    expect(valueToTest(0, 0, arr)).toBe(4);
    expect(valueToTest(1, 0, arr)).toBe(3);
    expect(valueToTest(2, 0, arr)).toBe(1);
    expect(valueToTest(3, 0, arr)).toBe(0);
    expect(valueToTest(4, 0, arr)).toBe(1);
  });

  it("should shuffle when from is random", () => {
    const valueToTest = distribute({ each: 1, from: "random" });
    const arr = new Array(3).fill(0);
    arr.forEach((v, index) => valueToTest(index, v, arr));
  });
});
