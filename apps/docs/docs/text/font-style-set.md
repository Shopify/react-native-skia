---
id: font-style-set
title: Font Style Sets
sidebar_label: Font Style Sets
slug: /text/font-style-set
---

`SkFontMgr` can enumerate the individual variants (regular, italic, bold,
condensed, etc.) that exist within a single font family. This is the lower-level
API that sits behind `matchFamilyStyle` and is useful when you need to:

- List every variant a family ships with (e.g. to build a weight/width picker).
- Pick the closest available variant to a target style and know exactly which
  one you got (name, weight, width, slant).
- Avoid the silent fallback that `matchFamilyStyle` performs when a family is
  missing — `matchFamily` returns `null` instead.

## `SkFontMgr.matchFamily`

```ts
matchFamily(name: string): SkFontStyleSet | null
```

Returns the set of variants registered for the named family, or `null` if the
family is not known. Family aliases such as `"System"` on iOS are resolved the
same way as `matchFamilyStyle`.

```tsx
import { Skia } from '@shopify/react-native-skia';

const styleSet = Skia.FontMgr.System().matchFamily('Helvetica');
if (styleSet) {
  console.log(`Helvetica ships ${styleSet.count()} variants`);
}
```

## `SkFontMgr.createStyleSet`

```ts
createStyleSet(index: number): SkFontStyleSet | null
```

Returns the style set for the family at the given family-index (0 through
`countFamilies() - 1`), or `null` if the index is out of range.

```tsx
const mgr = Skia.FontMgr.System();
for (let i = 0; i < mgr.countFamilies(); i++) {
  const name = mgr.getFamilyName(i);
  const set = mgr.createStyleSet(i);
  console.log(name, set?.count());
}
```

## `SkFontStyleSet`

An enumerable set of font variants for a single family. It is an opaque host
object; call `dispose()` when you are done with it.

| Method                                              | Description                                                                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `count(): number`                                   | Number of variants in the set.                                                                                                               |
| `getStyle(index: number): FontStyleEntry`           | Style metadata for the variant at `index`. Throws if out of range.                                                                           |
| `createTypeface(index: number): SkTypeface \| null` | Loads the typeface for the variant at `index`. Returns `null` if the system cannot produce it.                                               |
| `matchStyle(style: FontStyle): SkTypeface \| null`  | Returns the typeface whose style most closely matches `style`. Unlike `SkFontMgr.matchFamilyStyle`, this does not fall back across families. |
| `dispose(): void`                                   | Releases the underlying native object.                                                                                                       |

### `FontStyleEntry`

```ts
interface FontStyleEntry extends Required<FontStyle> {
  name: string;
}
```

- `weight`: one of `FontWeight` (100–1000). Custom fonts may use values outside
  the named constants.
- `width`: one of `FontWidth` (1–9).
- `slant`: one of `FontSlant` (`Upright`, `Italic`, `Oblique`).
- `name`: the variant's PostScript name (e.g. `"Helvetica-BoldOblique"`).

## Example: pick the closest variant in a family

```tsx
import {
  Skia,
  FontSlant,
  FontWeight,
  FontWidth,
  type FontStyleEntry,
} from '@shopify/react-native-skia';

const target = {
  weight: FontWeight.Medium,
  width: FontWidth.Normal,
  slant: FontSlant.Upright,
};

function pickClosest(family: string): FontStyleEntry | null {
  const set = Skia.FontMgr.System().matchFamily(family);
  if (!set || set.count() === 0) return null;

  let best: FontStyleEntry | null = null;
  let bestScore = Infinity;
  for (let i = 0; i < set.count(); i++) {
    const entry = set.getStyle(i);
    const score =
      Math.abs(entry.weight - target.weight) * 100 +
      Math.abs(entry.width - target.width) * 10 +
      (entry.slant === target.slant ? 0 : 1);
    if (score < bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  set.dispose();
  return best;
}
```

## Web support

`matchFamily` and `createStyleSet` are not currently supported on the web
renderer — CanvasKit does not expose the underlying `SkFontStyleSet` API. Both
methods will throw `"Not implemented on React Native Web"` when called in a web
build.
