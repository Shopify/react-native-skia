declare module "react-native-worklets" {
  export type WorkletClosure = Record<string, unknown>;

  interface WorkletInitData {
    code: string;
    location?: string;
    sourceMap?: string;
  }

  interface WorkletStackDetails {
    0: Error;
    1: number;
    2: number;
  }

  interface WorkletProps {
    __closure: WorkletClosure;
    __workletHash: number;
    __initData?: WorkletInitData;
    __init?: () => unknown;
    __stackDetails?: WorkletStackDetails;
    __pluginVersion?: string;
  }

  export type WorkletFunction<
    TArgs extends unknown[] = unknown[],
    TReturn = unknown,
  > = ((...args: TArgs) => TReturn) & WorkletProps;
}
