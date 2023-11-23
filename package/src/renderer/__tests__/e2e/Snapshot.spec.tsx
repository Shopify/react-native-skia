import { checkImage, itRunsE2eOnly } from "../../../__tests__/setup";
import { surface } from "../setup";

describe("Snapshot", () => {
  itRunsE2eOnly("should capture a simple snapshot", async () => {
    const img = await surface.screen("Snapshot1");
    checkImage(img, `snapshots/screens/snapshot1-${surface.OS}.png`);
  });
  itRunsE2eOnly("should capture a somewhat complex snapshot", async () => {
    const img = await surface.screen("Snapshot2");
    checkImage(img, `snapshots/screens/snapshot2-${surface.OS}.png`);
  });
});
