import { fitbox, rect, Group, Path } from "@shopify/react-native-skia";

import { CANVAS } from "../components";

const { width, height } = CANVAS;
const pad = 400;
const src = rect(0, 0, 20, 20);
const dst = rect(pad, pad, width - 2 * pad, height - 2 * pad);

export const ExpoLogo = () => {
  return (
    <Group transform={fitbox("contain", src, dst)}>
      <Path path="M12.07 8a.15...129L12.069 8z" color="white" />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        path="M9.584.02a.157.157 0 00-.157....z"
        color="white"
      />
    </Group>
  );
};
