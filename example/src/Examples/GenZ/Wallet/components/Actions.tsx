/* eslint-disable max-len */
import { text } from "stream/consumers";

import { Group, Path, RoundedRect, Text } from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

interface ActionProps {
  path: string;
  label: string;
  x: number;
}

const Action = ({ path, label, x }: ActionProps) => {
  const font = useFont("DMSansMedium", 12);
  const pos = font.measureText(label);
  return (
    <Group x={x}>
      <RoundedRect
        x={24.5}
        y={0}
        width={44}
        height={44}
        r={8}
        color="rgba(172, 172, 176, 0.24)"
      />
      <Group x={24.5 + (44 - 24) / 2} y={(44 - 24) / 2}>
        <Path
          path={path}
          style="stroke"
          strokeWidth={2}
          color="#1E1E20"
          strokeCap="round"
          strokeJoin="round"
        />
      </Group>
      <Text
        text={label}
        font={font}
        x={(93 - pos.width) / 2}
        y={48 + pos.height}
      />
    </Group>
  );
};

export const Actions = () => {
  return (
    <Group y={350 + 24}>
      <Action x={24} path="M12 5V19M5 12H19" label="Add Card" />
      <Action
        x={133}
        path="M1 7H23M3 1H21C22.1046 1 23 1.89543 23 3V15C23 16.1046 22.1046 17 21 17H3C1.89543 17 1 16.1046 1 15V3C1 1.89543 1.89543 1 3 1Z"
        label="Transfer to card"
      />
      <Action
        x={242}
        path="M21 1L10 12M21 1L14 21L10 12M21 1L1 8L10 12"
        label="Send Money"
      />
    </Group>
  );
};
