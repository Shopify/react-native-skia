import React from "react";
import { Dimensions } from "react-native";

import { CoonsPatchMeshGradient } from "./components/CoonsPatchMeshGradient";

const { width, height } = Dimensions.get("window");

export const Aurora = () => {
  return (
    <CoonsPatchMeshGradient
      rows={2}
      cols={2}
      colors={["#61DAFB", "#fb61da", "#61fbcf", "#dafb61"]}
      width={width}
      height={height}
    />
  );
};
