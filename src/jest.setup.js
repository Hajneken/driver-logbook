// global code that should be executed before each test, such as setting up a mock or stubbing a function
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
