export default {
  testEnvironment: "node",
  testMatch: ["**/*.spec.js"],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { babelConfig: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}