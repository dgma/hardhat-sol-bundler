import { type HardhatUserConfig } from "hardhat/config";
import { type DynamicLibrary } from "./src/deploy";
import "@nomicfoundation/hardhat-ethers";

const getAddr: (contractName: string) => DynamicLibrary =
  (contractName) => (_, ctx) =>
    ctx[contractName].address as string;

const config: HardhatUserConfig = {
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

export default config;
