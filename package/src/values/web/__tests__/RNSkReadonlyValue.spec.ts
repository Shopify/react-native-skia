import { RNSkReadonlyValue } from "../RNSkReadonlyValue";

describe("RNSkReadonlyValue", () => {
  it("should expose __typename as RNSkValue", () => {
    const valueToTest = new RNSkReadonlyValue(100);
    expect(valueToTest.__typename__).toEqual("RNSkValue");
  });
});
