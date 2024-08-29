import type { SkTypefaceFontProvider } from "./TypefaceFontProvider";

export interface TypefaceFontProviderFactory {
  Make(): SkTypefaceFontProvider;
}
