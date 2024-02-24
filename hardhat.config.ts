import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { parseEther } from "ethers";
import { VerifyPlugin } from "./plugins/Verify";
import { dynamicAddress, SupportedProxies } from "./src";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
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
          TestUpgradableContract: {
            proxy: {
              type: SupportedProxies.CLASSIC,
              unsafeAllow: ["external-library-linking"],
            },
            args: ["hello"],
            options: {
              libs: {
                TestLibrary: dynamicAddress("TestLibrary"),
              },
            },
          },
          TestContractFirst: {
            contractName: "TestContract",
            args: ["hello", parseEther("0.1")],
            options: {
              libs: {
                TestLibrary: dynamicAddress("TestLibrary"),
              },
            },
          },
          TestContractSecond: {
            contractName: "TestContract",
            args: ["hello", parseEther("0.2")],
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
