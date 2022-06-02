/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Ignore lib folder - contains build artifacts and should
  // not be probed for tests
  modulePathIgnorePatterns: ["<rootDir>/lib/typescript", "setup.ts$"],
  // We just this font mapping temporarlily for the FontMgr polyfill
  moduleNameMapper: {
    "^[./a-zA-Z0-9$_-]+Roboto-Medium\\.ttf$":
      "<rootDir>/src/skia/web/api/fonts/Roboto-Medium.ts",
  },
  transform: {
    "^.+\\.(js|jsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
};
