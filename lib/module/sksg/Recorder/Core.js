// export enum CommandType {
//   // Context
//   Group = "Group",
//   SavePaint = "SavePaint",
//   RestorePaint = "RestorePaint",
//   SaveCTM = "SaveCTM",
//   RestoreCTM = "RestoreCTM",
//   PushColorFilter = "PushColorFilter",
//   PushBlurMaskFilter = "PushBlurMaskFilter",
//   PushImageFilter = "PushImageFilter",
//   PushPathEffect = "PushPathEffect",
//   PushShader = "PushShader",
//   ComposeColorFilter = "ComposeColorFilter",
//   ComposeImageFilter = "ComposeImageFilter",
//   ComposePathEffect = "ComposePathEffect",
//   MaterializePaint = "MaterializePaint",
//   SaveBackdropFilter = "SaveBackdropFilter",
//   SaveLayer = "SaveLayer",
//   RestorePaintDeclaration = "RestorePaintDeclaration",
//   // Drawing
//   DrawBox = "DrawBox",
//   DrawImage = "DrawImage",
//   DrawCircle = "DrawCircle",
//   DrawPaint = "DrawPaint",
//   DrawPoints = "DrawPoints",
//   DrawPath = "DrawPath",
//   DrawRect = "DrawRect",
//   DrawRRect = "DrawRRect",
//   DrawOval = "DrawOval",
//   DrawLine = "DrawLine",
//   DrawPatch = "DrawPatch",
//   DrawVertices = "DrawVertices",
//   DrawDiffRect = "DrawDiffRect",
//   DrawText = "DrawText",
//   DrawTextPath = "DrawTextPath",
//   DrawTextBlob = "DrawTextBlob",
//   DrawGlyphs = "DrawGlyphs",
//   DrawPicture = "DrawPicture",
//   DrawImageSVG = "DrawImageSVG",
//   DrawParagraph = "DrawParagraph",
//   DrawAtlas = "DrawAtlas",
// }
export let CommandType = /*#__PURE__*/function (CommandType) {
  // Context
  CommandType[CommandType["Group"] = 0] = "Group";
  CommandType[CommandType["SavePaint"] = 1] = "SavePaint";
  CommandType[CommandType["RestorePaint"] = 2] = "RestorePaint";
  CommandType[CommandType["SaveCTM"] = 3] = "SaveCTM";
  CommandType[CommandType["RestoreCTM"] = 4] = "RestoreCTM";
  CommandType[CommandType["PushColorFilter"] = 5] = "PushColorFilter";
  CommandType[CommandType["PushBlurMaskFilter"] = 6] = "PushBlurMaskFilter";
  CommandType[CommandType["PushImageFilter"] = 7] = "PushImageFilter";
  CommandType[CommandType["PushPathEffect"] = 8] = "PushPathEffect";
  CommandType[CommandType["PushShader"] = 9] = "PushShader";
  CommandType[CommandType["ComposeColorFilter"] = 10] = "ComposeColorFilter";
  CommandType[CommandType["ComposeImageFilter"] = 11] = "ComposeImageFilter";
  CommandType[CommandType["ComposePathEffect"] = 12] = "ComposePathEffect";
  CommandType[CommandType["MaterializePaint"] = 13] = "MaterializePaint";
  CommandType[CommandType["SaveBackdropFilter"] = 14] = "SaveBackdropFilter";
  CommandType[CommandType["SaveLayer"] = 15] = "SaveLayer";
  CommandType[CommandType["RestorePaintDeclaration"] = 16] = "RestorePaintDeclaration";
  // Drawing
  CommandType[CommandType["DrawBox"] = 17] = "DrawBox";
  CommandType[CommandType["DrawImage"] = 18] = "DrawImage";
  CommandType[CommandType["DrawCircle"] = 19] = "DrawCircle";
  CommandType[CommandType["DrawPaint"] = 20] = "DrawPaint";
  CommandType[CommandType["DrawPoints"] = 21] = "DrawPoints";
  CommandType[CommandType["DrawPath"] = 22] = "DrawPath";
  CommandType[CommandType["DrawRect"] = 23] = "DrawRect";
  CommandType[CommandType["DrawRRect"] = 24] = "DrawRRect";
  CommandType[CommandType["DrawOval"] = 25] = "DrawOval";
  CommandType[CommandType["DrawLine"] = 26] = "DrawLine";
  CommandType[CommandType["DrawPatch"] = 27] = "DrawPatch";
  CommandType[CommandType["DrawVertices"] = 28] = "DrawVertices";
  CommandType[CommandType["DrawDiffRect"] = 29] = "DrawDiffRect";
  CommandType[CommandType["DrawText"] = 30] = "DrawText";
  CommandType[CommandType["DrawTextPath"] = 31] = "DrawTextPath";
  CommandType[CommandType["DrawTextBlob"] = 32] = "DrawTextBlob";
  CommandType[CommandType["DrawGlyphs"] = 33] = "DrawGlyphs";
  CommandType[CommandType["DrawPicture"] = 34] = "DrawPicture";
  CommandType[CommandType["DrawImageSVG"] = 35] = "DrawImageSVG";
  CommandType[CommandType["DrawParagraph"] = 36] = "DrawParagraph";
  CommandType[CommandType["DrawAtlas"] = 37] = "DrawAtlas";
  return CommandType;
}({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const materializeCommand = command => {
  "worklet";

  const newProps = {
    ...command.props
  };
  if (command.animatedProps) {
    for (const key in command.animatedProps) {
      newProps[key] = command.animatedProps[key].value;
    }
  }
  return {
    ...command,
    props: newProps
  };
};
export const isCommand = (command, type) => {
  "worklet";

  return command.type === type;
};
export const isGroup = command => {
  "worklet";

  return command.type === CommandType.Group;
};
export const isDrawCommand = (command, type) => {
  "worklet";

  return command.type === type;
};
//# sourceMappingURL=Core.js.map