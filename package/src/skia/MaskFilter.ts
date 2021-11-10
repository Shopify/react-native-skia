export enum BlurStyle {
  Normal, //!< fuzzy inside and outside
  Solid, //!< solid inside, fuzzy outside
  Outer, //!< nothing inside, fuzzy outside
  Inner, //!< fuzzy inside, nothing outside
}

export interface IMaskFilter {}
