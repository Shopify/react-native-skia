import type { SkRect } from "@shopify/react-native-skia";
import { Group, fitbox, rect } from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import React, { Children } from "react";

interface RowProps {
  children: ReactNode[] | ReactNode;
  container: SkRect;
  item: SkRect;
}

export const Row = ({ children, container, item }: RowProps) => {
  const count = Children.count(children);
  const size = container.width / count;
  return (
    <>
      {Children.map(children, (child, index) => {
        return (
          <Group transform={[{ translateX: size * index }]}>
            <Group
              transform={fitbox(
                "contain",
                item,
                rect(0, 0, size, container.height)
              )}
            >
              {child}
            </Group>
          </Group>
        );
      })}
    </>
  );
};
