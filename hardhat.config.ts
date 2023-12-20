import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import { dynamicAddress } from "./src";
import { VerifyPlugin } from "./src/plugins/Verify";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    sources: "./testData",
    tests: "./integration",
  },
  networks: {
    hardhat: {
      deployment: {
        plugins: [VerifyPlugin],
        config: {
          TestLibrary: {},
          TestContract: {
            args: ["hello"],
            options: {
              libs: {
                TestLibrary: dynamicAddress("TestLibrary"),
              },
            },
          },
        },
      },
    },
  },
};

export default config;
