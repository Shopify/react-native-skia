export type TestProps = {
  width: number;
  height: number;
};

export type SingleTest = {
  component: React.FC<TestProps>;
  description?: string;
  onMounted?: () => Promise<void>;
};
export type Tests = { [key: string]: SingleTest };
export type TestHierarchy = { [key: string]: Tests | TestHierarchy };

export const isTest = (
  test: Tests | SingleTest | TestHierarchy
): test is SingleTest => "component" in test;

export const getByPath = (path: string[], obj: TestHierarchy) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = obj;
  path.forEach((key) => (cur = cur[key]));
  return cur as TestHierarchy;
};
