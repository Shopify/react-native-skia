import type { crossplatformFindNodeHandle as original } from "./find-node-handle";

export const crossplatformFindNodeHandle: typeof original = {
  findNodeHandle: () => {
    throw new Error("findNodeHandle is not supported on the web");
  },
};
