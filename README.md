# hardhat-sol-bundler

Build, update and redeploy smart contracts with hardhat with one config.
`sol-bundler` tracks contract changes and redeploys only those where any changes were made.

## Installation

run `npm install --save-dev @dgma/hardhat-sol-bundler`

## Usage

1. Create deployment config in hardhat:

```ts
import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import { dynamicAddress } from "@dgma/hardhat-sol-bundler";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    sources: "./testData",
    tests: "./integration",
  },
  networks: {
    hardhat: {
      deployment: {
        lockFile: "deployment-lock.json",
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
```

2. Run task:

```sh
npx hardhat deploy-bundle
```
