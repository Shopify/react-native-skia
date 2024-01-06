import { resolveFile, surface } from "../setup";
import { checkImage, docPath } from "../../../__tests__/setup";

const RobotoMedium = Array.from(
  resolveFile("skia/__tests__/assets/Roboto-Medium.ttf")
);

describe("Paragraphs", () => {
  it("Should build the first example from the documentation", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const robotoMedium = Skia.Typeface.MakeFreeTypeFaceFromData(
          Skia.Data.fromBytes(new Uint8Array(ctx.RobotoMedium))
        )!;
        const provider = Skia.TypefaceFontProvider.Make();
        provider.registerFont(robotoMedium, "Roboto");
        const colors = ["#dafb61", "#61DAFB", "#fb61da", "#61fbcf"].flatMap(
          (c) => Array.from(Skia.Color(c))
        );
        const rt = Skia.RuntimeEffect.Make(ctx.bilinearInterpolation)!;
        const backgroundPaint = Skia.Paint();
        backgroundPaint.setShader(
          rt.makeShader([0, 0, ctx.width, ctx.height, ...colors])
        );
        const foregroundPaint = Skia.Paint();
        foregroundPaint.setShader(
          Skia.Shader.MakeRadialGradient(
            { x: 0, y: 0 },
            ctx.width,
            ["magenta", "yellow"].map((cl) => Skia.Color(cl)),
            null,
            0
          )
        );
        const para = Skia.ParagraphBuilder.Make({}, provider)
          .pushStyle(
            {
              fontFamilies: ["Roboto"],
              fontSize: 72,
              fontStyle: { weight: 500 },
            },
            foregroundPaint,
            backgroundPaint
          )
          .addText("Say Hello to Skia")
          .pop()
          .build();
        para.layout(ctx.width);
        para.paint(canvas, 0, 0);
      },
      {
        RobotoMedium,
        width: surface.width,
        height: surface.height,
        bilinearInterpolation: `
        uniform vec4 position;
        uniform vec4 colors[4];
        
        vec4 main(vec2 pos) {
          vec2 uv = (pos - vec2(position.x, position.y))/vec2(position.z, position.w);
          vec4 colorA = mix(colors[0], colors[1], uv.x);
          vec4 colorB = mix(colors[2], colors[3], uv.x);
          return mix(colorA, colorB, uv.y);
        }`,
      }
    );
    checkImage(img, docPath(`paragraph/background-${surface.OS}.png`));
  });
});
