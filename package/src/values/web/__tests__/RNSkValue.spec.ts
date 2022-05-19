import { RNSkValue } from "../RNSkValue";

describe("RNSkValue", () => {
  it("should notify on change", () => {
    const valueToTest = new RNSkValue(100);
    const spy = jest.fn();
    valueToTest.addListener(spy);
    valueToTest.current = 200;
    expect(spy).toHaveBeenCalledWith(200);
  });
});
