import { press, takeScreenshot } from "react-native-owl";

describe("Skia API Examples", () => {
  beforeAll(async () => {
    await press("API");
  });

  it("Shapes", async () => {
    await press("Shapes");
    const screen = await takeScreenshot("API_Shapes");
    expect(screen).toMatchBaseline();
  });

  it("Images", async () => {
    await press("Images");
    const screen = await takeScreenshot("API_Images");
    expect(screen).toMatchBaseline();
  });

  afterAll(async () => {
    await press("back");
  });
});
