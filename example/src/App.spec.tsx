/**
 * @format
 */
import "react-native";
import React from "react";
// Test renderer must be required after react-native.
import renderer from "react-test-renderer";

import App from "./App";

// Here we cannot use the jestSetup file because we use the linked version of the package
jest.mock("@shopify/react-native-skia", () =>
  require("../../package/src/mock")
);

it("renders correctly", () => {
  renderer.create(<App />);
});
