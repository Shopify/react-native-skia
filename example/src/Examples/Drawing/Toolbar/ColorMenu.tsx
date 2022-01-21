import React, { useCallback, useEffect, useState } from "react";

import { useDrawContext, useUxContext } from "../Context";

import type { BaseToolbarProps } from "./BaseToolbar";
import { BaseToolbar } from "./BaseToolbar";
import { ColorToolbarItem } from "./Items";

type Props = BaseToolbarProps & {
  colors: string[];
};

export const ColorMenu: React.FC<Props> = ({ colors, style, vertical }) => {
  const uxContext = useUxContext();

  const [visible, setVisible] = useState(uxContext.state.menu === "color");

  useEffect(
    () =>
      uxContext.addListener((state) => {
        setVisible(state.menu === "color");
      }),
    [uxContext]
  );

  const drawContext = useDrawContext();
  const handleSelectColor = useCallback(
    (c: string) => {
      uxContext.commands.toggleMenu(undefined);
      drawContext.commands.setColor(c);
    },
    [drawContext.commands, uxContext.commands]
  );

  return visible ? (
    <BaseToolbar style={style} vertical={vertical}>
      {colors.map((c) => (
        <ColorToolbarItem
          color={c}
          key={c}
          selected={drawContext.state.color === c}
          onPress={() => handleSelectColor(c)}
        />
      ))}
    </BaseToolbar>
  ) : null;
};
