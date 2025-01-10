// 1. Tokenize to Uppercase
type Tokenize<
  W extends string,
  R extends string[] = []
> = W extends `${infer H}${infer T}` ? Tokenize<T, [...R, Uppercase<H>]> : R;

// 2. Is the letter contained in a word?
type Contains<
  L extends string,
  W extends string[],
  I extends 0[] = []
> = I["length"] extends W["length"]
  ? false
  : W[I["length"]] extends L
  ? true
  : Contains<L, W, [...I, 0]>;
// 3. Is the letter a 🟩, 🟨, or ⬜️
type Wordle<
  G extends string[],
  W extends string[],
  R extends string[] = []
> = R["length"] extends W["length"]
  ? R
  : Wordle<
      G,
      W,
      [
        ...R,
        G[R["length"]] extends W[R["length"]]
          ? "🟩"
          : Contains<G[R["length"]], W> extends true
          ? "🟨"
          : "🔲"
      ]
    >;

// 4. check each letter
type Guess<G extends string> = Wordle<Tokenize<G>, Tokenize<"trait">>;
//
//
//
type G1 = Guess<"react">;
// 🟨 🔲 🟩 🔲 🟩

type G2 = Guess<"spoil">;
// ["🔲", "🟨", "🟨",
//           "🟨", "🔲"];
//
type G3 = Guess<"point">;
//  ["🟩", "🟨", "🟨", "🟨", "🟨"];
//
//
type G4 = Guess<"pinto">;
//   G4 = ["🟩", "🟩", "🟩", "🟩", "🟩"];
//
//
