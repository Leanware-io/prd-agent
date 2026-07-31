import { createDefaultEsmPreset, type JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  ...createDefaultEsmPreset({
    tsconfig: "tsconfig.app.json",
  }),
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/shared/config/*", // Exclude specific config file
    "!src/shared/ui/icons/*", // Exclude icons
    "!src/**/*index.{ts,tsx}",
    "!src/**/*.config.{ts,tsx}",
    "!src/**/*.d.ts", // Exclude type definition files
    "!src/**/index.ts", // Exclude index files (if they only export things)
    "!src/**/types.ts", // Exclude utility type definition files
    "!src/**/*.test.{ts,tsx}", // Exclude test files themselves from coverage
    "!src/**/*.spec.{ts,tsx}", // Exclude spec files (test cases)
    "!jest.setup.ts", // Exclude Jest setup file
  ],
  moduleFileExtensions: ["js", "ts", "tsx"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg|mp3|ogg|wav)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "react-markdown": "<rootDir>/__mocks__/reactMarkdownMock.tsx",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};

export default config;
