import { LoadSkia } from "@shopify/react-native-skia/src/web";

beforeAll(async () => {
  await LoadSkia();
});

jest.mock("@shopify/react-native-skia", () => {
  return {
    Skia: JsiSkApi(global.CanvasKit),
  };
});
