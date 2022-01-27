import React, { useCallback, useEffect, useState } from "react";

import { useDrawContext, useUxContext } from "../Context";

import type { BaseToolbarProps } from "./BaseToolbar";
import { BaseToolbar } from "./BaseToolbar";
import { SizeToolbarItem } from "./Items";

type Props = BaseToolbarProps & {
  sizes: number[];
};

export const SizeMenu: React.FC<Props> = ({ style, sizes, mode }) => {
  const uxContext = useUxContext();
  const drawContext = useDrawContext();

  const [visible, setVisible] = useState(uxContext.state.menu === "size");

  useEffect(
    () =>
      uxContext.addListener((state) => {
        setVisible(state.menu === "size");
      }),
    [uxContext]
  );

  const handleSelectSize = useCallback(
    (s: number) => {
      uxContext.commands.toggleMenu(undefined);
      drawContext.commands.setSize(s);
    },
    [drawContext.commands, uxContext.commands]
  );

  return visible ? (
    <BaseToolbar style={style} mode={mode}>
      {sizes.map((s) => (
        <SizeToolbarItem
          key={s}
          size={s}
          selected={drawContext.state.size === s}
          onPress={() => handleSelectSize(s)}
        />
      ))}
    </BaseToolbar>
  ) : null;
};
