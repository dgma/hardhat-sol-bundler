# hardhat-sol-bundler

Build, update and redeploy smart contracts with hardhat with one config.

## Features

- Declarative deployment configuration
- Deployment runtime accessibility (see [hooks](#hooks) and [deployment-output](#deployment-output))
- If selected, deploys only modified contracts (code or constructor arguments)
- Selective contract verification
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
      verify: true,
    },
  },
};
```

**note** verify plugin uses [@nomicfoundation/hardhat-verify](https://www.npmjs.com/package/@nomicfoundation/hardhat-verify). Please make sure you have configured using config according to official plugin guidance.

## Hooks

The library can be easily extended with custom plugins by adding them to `deployment.plugins` list. A simple example of the plugin can be found in `plugins/Verify.ts`.

During deployment, sol-bundler can execute additional logic implemented as lifecycle hooks:

```
BEFORE_CONTEXT_INITIALIZATION - fires once, before deployment runtime context creation;
BEFORE_DEPLOYMENT - fires once, after deployment runtime context creation and before deployment logic initiation;

BEFORE_DEPENDENCY_RESOLUTION - fires for each contract in config, before resolving dynamically contract dependencies (arguments and libraries);

BEFORE_CONTRACT_BUILD - fires for each contract in config, before creating contract factory;
AFTER_CONTRACT_BUILD - fires for each contract in config, after creating contract factory;

BEFORE_CONTRACT_DEPLOY - fires for each contract in config, before contract deployment;
AFTER_DEPLOYMENT - fires for each contract in config, after contract deployment;

AFTER_CONTEXT_SERIALIZATION: "AFTER_CONTEXT_SERIALIZATION" - fires for each contract in config, after deployment runtime context serialization (preparation for storing output into lock file);

AFTER_CONTRACT_DEPLOY - fires once, after all contracts deployment;
```

## Deployment output

Deployment script can be easily attached to the other tasks or libraries:

```ts
import hre from "hardhat";
import { solBundler } from "@dgma/hardhat-sol-bundler";

const { ctx, deployedContracts } = await solBundler(hre);

// add custom logic
if (deployedContracts.includes("MyContract")) {
  console.log("do something");
}
```

## Contributing

Contributions are always welcome! Open a PR or an issue!
