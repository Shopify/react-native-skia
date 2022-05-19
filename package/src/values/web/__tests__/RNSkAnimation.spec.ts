import { RNSkAnimation } from "../RNSkAnimation";
import { RNSkValue } from "../RNSkValue";

describe("RNSkAnimation", () => {
  it("should update a value", () => {
    const valueToTest = new RNSkValue(0);
    const raf = (cb: (t: number) => void) => {
      cb(1);
      return 1;
    };
    valueToTest.animation = new RNSkAnimation(
      () => ({
        finished: true,
        current: 1,
      }),
      raf
    );
    valueToTest.animation.stop();
    expect(valueToTest.current).toBe(1);
  });
});
