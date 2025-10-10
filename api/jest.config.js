const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@auth/routes$": "<rootDir>/src/modules/auth/auth.routes.ts",
    "^@auth/models$": "<rootDir>/src/modules/auth/models/index.ts",
    "^@auth/(.*)$": "<rootDir>/src/modules/auth/$1"
  }
};