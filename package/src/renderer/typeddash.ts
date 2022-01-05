export const mapKeys = <T>(obj: T) => Object.keys(obj) as (keyof T)[];

export const exhaustiveCheck = (a: never): never => {
  throw new Error(`Unexhaustive handling for ${a}`);
};
