import { CI, checkImage, itRunsE2eOnly } from "../../../__tests__/setup";
import { surface } from "../setup";

const output = (name: string) =>
  `snapshots/screens/${name}-${surface.OS}${CI ? "-ci" : ""}.png`;

describe("Snapshot", () => {
  itRunsE2eOnly("should capture a simple snapshot", async () => {
    const img = await surface.screen("Snapshot1");
    checkImage(img, output("snapshot1"));
  });
  itRunsE2eOnly("should capture a somewhat complex snapshot", async () => {
    const img = await surface.screen("Snapshot2");
    checkImage(img, output("snapshot2"));
  });
  itRunsE2eOnly("should respect overflow: hidden", async () => {
    const img = await surface.screen("Snapshot3");
    checkImage(img, output("snapshot3"));
  });
  itRunsE2eOnly("should respect overflow: hidden", async () => {
    const img = await surface.screen("Snapshot4");
    checkImage(img, output("snapshot4"));
  });
});
