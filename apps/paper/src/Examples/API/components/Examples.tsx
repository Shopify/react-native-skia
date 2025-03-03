import React, { Children } from "react";
import { ScrollView } from "react-native";
import { Canvas } from "@shopify/react-native-skia";

import { ExportableCanvas } from "../../../components/ExportableCanvas";

export const SIZE = 256;

interface ExamplesProps {
  children: any | any[];
  exportable?: boolean;
}

export const Examples = ({ children, exportable }: ExamplesProps) => {
  const examples = Children.toArray(children);
  const CANVAS = exportable ? ExportableCanvas : Canvas;
  return (
    <ScrollView>
      {examples.map((example, index) => (
        <CANVAS style={{ width: SIZE, height: SIZE }} key={index}>
          {example}
        </CANVAS>
      ))}
    </ScrollView>
  );
};
