import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import { dynamicAddress, dynamicExternalAddress } from "./src";
import ExternalsPlugin from "./src/plugins/Externals";
import VerifyPlugin from "./src/plugins/Verify";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    sources: "./testData",
    tests: "./integration",
  },
  networks: {
    hardhat: {
      deployment: {
        plugins: [VerifyPlugin, ExternalsPlugin],
        config: {
          TestLibrary: {},
          TestContract: {
            args: [dynamicExternalAddress("ExternalContract")],
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
