import React from "react";

import { CoonsPatchMeshGradient } from "./components/CoonsPatchMeshGradient";

// #FEF8C4
// #372CE6
// #D56450
// #DC4C87
export const Aurora = () => {
  return (
    <CoonsPatchMeshGradient
      rows={3}
      cols={3}
      colors={["#61DAFB", "#fb61da", "#61fbcf", "#dafb61"]}
      lines
    />
  );
};
