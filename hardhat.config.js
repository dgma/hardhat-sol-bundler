require("@nomicfoundation/hardhat-toolbox");

const getAddr = (contractName) => (_, ctx) => ctx[contractName].address;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  paths: {
    sources: "./testData",
    tests: "./integration",
  },
  networks: {
    hardhat: {
      deployment: {
        config: {
          TestLibrary: {},
          TestContract: {
            args: ["hello"],
            options: {
              libs: {
                TestLibrary: getAddr("TestLibrary"),
              },
            },
          },
        },
      },
    },
  },
};
