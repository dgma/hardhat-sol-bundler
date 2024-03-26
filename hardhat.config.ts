import { parseEther } from "ethers";
import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { LoggingPlugin } from "./plugins/Logging";
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
        plugins: [VerifyPlugin, LoggingPlugin],
        config: {
          LenLibrary: {},
          MockTransparentUpgradable: {
            proxy: {
              type: SupportedProxies.TRANSPARENT,
              unsafeAllow: ["external-library-linking"],
            },
            args: ["hello"],
            options: {
              libs: {
                LenLibrary: dynamicAddress("LenLibrary"),
              },
            },
          },
          MockUUPSUpgradable: {
            proxy: {
              type: SupportedProxies.UUPS,
              unsafeAllow: ["external-library-linking"],
            },
            args: ["hello"],
            options: {
              libs: {
                LenLibrary: dynamicAddress("LenLibrary"),
              },
            },
          },
          MockContractFirst: {
            contractName: "MockContract",
            args: ["hello", parseEther("0.1")],
            options: {
              libs: {
                LenLibrary: dynamicAddress("LenLibrary"),
              },
            },
          },
          MockContractSecond: {
            contractName: "MockContract",
            args: ["hello", parseEther("0.2")],
            options: {
              libs: {
                LenLibrary: dynamicAddress("LenLibrary"),
              },
            },
          },
        },
      },
    },
  },
};

export default config;
