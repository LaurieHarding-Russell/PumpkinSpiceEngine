export default {
  testEnvironment: "node",
  testMatch: ["**/*.spec.js"],
  transform: { '\\.js$': 'babel-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}