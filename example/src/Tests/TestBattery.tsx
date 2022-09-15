import { Shapes, BlendModes } from "./Battery";
import type { SingleTest, TestHierarchy } from "./types";
import { isTest } from "./types";

export const TestBattery: TestHierarchy = {
  Shapes,
  BlendModes,
};

type ReturnValue = { path: string[]; test: SingleTest };

const getFlattenedTests = (
  data: TestHierarchy | SingleTest,
  path: string[] = []
): ReturnValue[] => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (isTest(value)) {
      return [...acc, { path: [...path, key], test: value as SingleTest }];
    }
    return [...acc, ...getFlattenedTests(value, [...path, key])];
  }, [] as ReturnValue[]);
};

export const FlattenedTestBattery = getFlattenedTests(TestBattery);
