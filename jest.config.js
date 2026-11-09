export default {
  testEnvironment: "node",
  transform: {},
  clearMocks: true,
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.js",
    "<rootDir>/tests/integration/**/*.test.js"
  ],
  setupFiles: ["<rootDir>/tests/setupEnv.js"]
};
