/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Ignore lib folder - contains build artifacts and should
  // not be probed for tests
  modulePathIgnorePatterns: [
    "<rootDir>/lib/typescript",
    "(setup)|(setup.(ts|tsx))$|globalSetup.ts|globalTeardown.ts",
  ],
  transform: {
    "^.+\\.(js|jsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  globalSetup: "<rootDir>/src/__tests__/globalSetup.ts",
  globalTeardown: "<rootDir>/src/__tests__/globalTeardown.ts",
};
