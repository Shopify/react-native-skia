/**
 * @format
 */

import "react-native";

// eslint-disable-next-line import/order
import React from "react";

// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer";

import App from "../App";

it("renders correctly", () => {
  renderer.create(<App />);
});
