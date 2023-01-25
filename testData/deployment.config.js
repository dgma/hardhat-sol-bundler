module.exports = {
  testLibrary: {
    name: "TestLibrary",
  },
  testContract: {
    name: "TestContract",
    libs: {
      TestLibrary: "testLibrary",
    },
    deploymentArgs: ["hello"]
  },
}