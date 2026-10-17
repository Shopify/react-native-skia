export type BenchParams = { auto?: boolean } | undefined;

export type Routes = {
  List: undefined;
  HeavyCanvas: BenchParams;
  ManyCanvases: BenchParams;
  AndroidBacking: BenchParams;
  SmallIcon: BenchParams;
  GcStorm: BenchParams;
};
