import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import type { IPath } from "../../../skia/Path";
import type { IFont } from "../../../skia/Font";

export interface TextPathProps extends CustomPaintProps {
  string: string;
  path: IPath;
  font: IFont;
  initialOffset: number;
}

export const TextPath = (props: AnimatedProps<TextPathProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { string, path, font, initialOffset }) => {
      // const ids = font.getGlyphIDs(string);
      // const widths = font.getGlyphWidths(ids);
      // const rsx: IRSXform[] = [];
      // const meas = new Skia.ContourMeasureIter(path, false, 1);
      // let cont = meas.next();
      // let dist = initialOffset;
      // const xycs = new Float32Array(4);
      // for (let i = 0; i < string.length && cont; i++) {
      //   const width = widths[i];
      //   dist += width / 2;
      //   if (dist > cont.length()) {
      //     // jump to next contour
      //     cont.delete();
      //     cont = meas.next();
      //     if (!cont) {
      //       // We have come to the end of the path - terminate the string
      //       // right here.
      //       string = string.substring(0, i);
      //       break;
      //     }
      //     dist = width / 2;
      //   }
      //   // Gives us the (x, y) coordinates as well as the cos/sin of the tangent
      //   // line at that position.
      //   cont.getPosTan(dist, xycs);
      //   var cx = xycs[0];
      //   var cy = xycs[1];
      //   var cosT = xycs[2];
      //   var sinT = xycs[3];
      //   var adjustedX = cx - (width / 2) * cosT;
      //   var adjustedY = cy - (width / 2) * sinT;
      //   rsx.push(cosT, sinT, adjustedX, adjustedY);
      //   dist += width / 2;
      // }
      // var retVal = Skia.TextBlob.MakeFromRSXform(string, rsx, font);
      // return retVal;
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

TextPath.defaultProps = {
  initialOffset: 0,
};
