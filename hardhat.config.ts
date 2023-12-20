import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import ExternalsPlugin from "./plugins/Externals";
import VerifyPlugin from "./plugins/Verify";
import { dynamicAddress } from "./src";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    sources: "./testData",
    tests: "./integration",
  },
  networks: {
    hardhat: {
      deployment: {
        // lockFile: "random.json",
        // verify: true,
        plugins: [VerifyPlugin, ExternalsPlugin],
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
        externals: {
          ExternalContract: {
            address: "0x0000000000000000000000000000000000000000",
            abi: [],
          },
        },
      },
    },
  },
};

export default config;
