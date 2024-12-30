declare module "*.sksl" {
  const content: string;
  // eslint-disable-next-line import/no-default-export
  export default content;
}

declare module "flubber" {
  export function interpolate<S extends boolean = true>(
    p1: string,
    p2: string,
    options?: { maxSegmentLength?: number; string?: S }
  ): (t: number) => S extends true ? string : [number, number][];
}
