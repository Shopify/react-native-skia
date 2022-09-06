import type { SkRSXform, SkTextBlob, Skia, SkPoint } from "../../../skia/types";
import type {
  DrawingContext,
  TextBlobProps,
  TextPathProps,
  TextProps,
} from "../../types";
import { NodeType } from "../../types";
import { processPath } from "../datatypes";
import type { GlyphsProps } from "../../types/Drawings";
import { JsiDrawingNode } from "../DrawingNode";

export class TextNode extends JsiDrawingNode<TextProps> {
  constructor(Skia: Skia, props: TextProps) {
    super(Skia, NodeType.Text, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { text, x, y, font } = this.props;
    canvas.drawText(text, x, y, paint, font);
  }
}

export class TextPathNode extends JsiDrawingNode<TextPathProps> {
  blob?: SkTextBlob;

  constructor(Skia: Skia, props: TextPathProps) {
    super(Skia, NodeType.TextPath, props);
    this.onPropChange();
  }

  onPropChange() {
    const path = processPath(this.Skia, this.props.path);
    const { font, initialOffset } = this.props;
    let { text } = this.props;
    const ids = font.getGlyphIDs(text);
    const widths = font.getGlyphWidths(ids);
    const rsx: SkRSXform[] = [];
    const meas = this.Skia.ContourMeasureIter(path, false, 1);
    let cont = meas.next();
    let dist = initialOffset;
    for (let i = 0; i < text.length && cont; i++) {
      const width = widths[i];
      dist += width / 2;
      if (dist > cont.length()) {
        // jump to next contour
        cont = meas.next();
        if (!cont) {
          // We have come to the end of the path - terminate the string
          // right here.
          text = text.substring(0, i);
          break;
        }
        dist = width / 2;
      }
      // Gives us the (x, y) coordinates as well as the cos/sin of the tangent
      // line at that position.
      const { px, py, tx, ty } = cont.getPosTan(dist);
      const adjustedX = px - (width / 2) * tx;
      const adjustedY = py - (width / 2) * ty;
      rsx.push(this.Skia.RSXform(tx, ty, adjustedX, adjustedY));
      dist += width / 2;
    }
    this.blob = this.Skia.TextBlob.MakeFromRSXform(text, rsx, font);
  }

  draw({ canvas, paint }: DrawingContext) {
    if (!this.blob) {
      throw new Error("TextPathNode: blob is null");
    }
    canvas.drawTextBlob(this.blob, 0, 0, paint);
  }
}

export class TextBlobNode extends JsiDrawingNode<TextBlobProps> {
  constructor(Skia: Skia, props: TextBlobProps) {
    super(Skia, NodeType.TextBlob, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { blob, x, y } = this.props;
    canvas.drawTextBlob(blob, x, y, paint);
  }
}

interface ProcessedGlyphs {
  glyphs: number[];
  positions: SkPoint[];
}

export class GlyphsNode extends JsiDrawingNode<GlyphsProps> {
  processedGlyphs?: ProcessedGlyphs;

  constructor(Skia: Skia, props: GlyphsProps) {
    super(Skia, NodeType.Glyphs, props);
    this.onPropChange();
  }

  onPropChange() {
    this.processedGlyphs = this.props.glyphs.reduce<ProcessedGlyphs>(
      (acc, glyph) => {
        const { id, pos } = glyph;
        acc.glyphs.push(id);
        acc.positions.push(pos);
        return acc;
      },
      { glyphs: [], positions: [] }
    );
  }

  draw({ canvas, paint }: DrawingContext) {
    if (!this.processedGlyphs) {
      throw new Error("GlyphsNode: processedGlyphs is null");
    }
    const { glyphs, positions } = this.processedGlyphs;
    const { x, y, font } = this.props;
    canvas.drawGlyphs(glyphs, positions, x, y, font, paint);
  }
}
