export interface ITypeface {
  readonly bold: boolean;
  readonly italic: boolean;
}

export enum FontStyle {
  Normal = 0,
  Bold = 1,
  Italic = 2,
  BoldItalic = 3,
}
