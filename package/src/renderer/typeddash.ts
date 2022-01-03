export const mapKeys = <T>(obj: T) => Object.keys(obj) as (keyof T)[];

export const hasProperty = (obj: unknown, key: string) =>
  !!(typeof obj === "object" && obj !== null && key in obj);

export const exhaustiveCheck = (a: never): never => {
  throw new Error(`Unexhaustive handling for ${a}`);
};
