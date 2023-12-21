# hardhat-sol-bundler

Build, update and redeploy smart contracts with hardhat with one config.

## Features

- Declarative deployment configuration
- Deployment runtime accessability
- If selected, deploys only modified contracts (code or constructor arguments)
- Selective contract verification
- External contracts as a dependency
- Human-ridable deployment output

## Installation

run `npm install --save-dev @dgma/hardhat-sol-bundler`

## Usage

1. Create deployment config in hardhat.config for the specific network:

```ts
import { type HardhatUserConfig } from "hardhat/config";
// no need @nomicfoundation/hardhat-ethers if you use @nomicfoundation/hardhat-toolbox
import "@nomicfoundation/hardhat-ethers";
import { dynamicAddress } from "@dgma/hardhat-sol-bundler";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      deployment: {
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

**note**: dependant contract must be located above

2. Run task:

```sh
npx hardhat deploy-bundle
```

## Configuration

By default, hardhat-sol-bundler supports only deployment runtime accessability.

- To deploy only modified contracts, add `lockFile` property to deployment

```ts
const deployment = {
  lockFile: "deployment-lock.json",
  config: {
    // contracts..
  },
};
```

- To verify deployed contracts during runtime.

```ts
// no need @nomicfoundation/hardhat-verify if you use @nomicfoundation/hardhat-toolbox
import "@nomicfoundation/hardhat-verify";
import { VerifyPlugin } from "@dgma/hardhat-sol-bundler/plugins/Verify";

const deployment = {
  plugins: [VerifyPlugin],
  // set a config level verification
  verify: true,
  config: {
    TestContract: {
      // set a contract level verification. Overrides global verification
      verify: true
    }
  },
};
```

**note** verify plugin uses [@nomicfoundation/hardhat-verify](https://www.npmjs.com/package/@nomicfoundation/hardhat-verify). Please make sure you have configured using config according to official plugin guidance.

## Contributing

Contributions are always welcome! Open a PR or an issue!
