import {
  Fill,
  Image,
  Offset,
  Paint,
  Text,
  useImage,
  Morphology,
  Group,
  DisplacementMap,
  Turbulence,
} from "@shopify/react-native-skia";
import React from "react";

import { Examples, SIZE } from "./components/Examples";

const DisplacementMapDemo = () => {
  const image = useImage(require("../../assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Group>
      <Paint>
        <DisplacementMap channelX="r" channelY="a" scale={20}>
          <Turbulence freqX={0.01} freqY={0.05} octaves={2} />
        </DisplacementMap>
      </Paint>
      <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
    </Group>
  );
};
const OffsetDemo = () => {
  const image = useImage(require("../../assets/oslo.jpg"));
  if (!image) {
    return null;
  }
  return (
    <Group>
      <Fill color="lightblue" />
      <Paint>
        <Offset x={SIZE / 4} y={SIZE / 4} />
      </Paint>
      <Image image={image} x={0} y={0} width={SIZE} height={SIZE} fit="cover" />
    </Group>
  );
};

const MorphologyDemo = () => {
  return (
    <Group>
      <Text
        text="Hello World"
        x={32}
        y={32}
        familyName="sans-serif"
        size={24}
      />
      <Paint>
        <Morphology radius={1} />
      </Paint>
      <Text
        text="Hello World"
        x={32}
        y={64}
        familyName="sans-serif"
        size={24}
      />
      <Paint>
        <Morphology radius={0.3} operator="erode" />
      </Paint>
      <Text
        text="Hello World"
        x={32}
        y={96}
        familyName="sans-serif"
        size={24}
      />
    </Group>
  );
};

export const ImageFilters = () => {
  return (
    <Examples>
      <DisplacementMapDemo />
      <OffsetDemo />
      <MorphologyDemo />
    </Examples>
  );
};
