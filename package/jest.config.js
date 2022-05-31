/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Ignore lib folder - contains build artifacts and should
  // not be probed for tests
  modulePathIgnorePatterns: ["<rootDir>/lib/typescript", "setup.ts$"],
};
