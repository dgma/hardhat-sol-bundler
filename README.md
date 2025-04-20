# hardhat-sol-bundler

Hardhat plugin for declarative smart contract deployments and redeployments.

## Features

- Declarative deployment configuration
- Deployment runtime accessibility (see [hooks](#hooks) and [deployment-output](#deployment-output))
- If selected, deploys only modified contracts (code or constructor arguments)
- Selective contract verification
- Human-ridable deployment output

## Installation

run `npm install --save-dev @dgma/hardhat-sol-bundler`

in addition, the next peer dependencies should be installed:

- "@nomicfoundation/hardhat-ethers": "^3.0.8"
- "@nomicfoundation/hardhat-verify": "^2.0.13"
- "@openzeppelin/hardhat-upgrades": "^3.9.0"
- "ethers": "^6.13.5"
- "hardhat": "^2.23.0"

## Usage

1. Import @nomicfoundation/hardhat-ethers, @nomicfoundation/hardhat-verify and @openzeppelin/hardhat-upgrades to `hardhat.config`

2. Create deployment config in hardhat.config for the specific network:

```ts
import { type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-upgrades";
import { dynamicAddress } from "@dgma/hardhat-sol-bundler";
import { Logging } from "@dgma/hardhat-sol-bundler/plugins/Logging";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      deployment: {
        plugins: [Logging], // logs the deployment result
        config: {
          TestLibrary: {},
          TestContractOne: {
            contractName: "TestContract",
            args: ["hello one"],
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

`contractName` property is optional and only needed if the configuration contract key is not the same as the contract name

**note**: the dependant contract must be located above

2. Run task:

```sh
npx hardhat deploy-bundle
```

```sh
npx hardhat deploy-bundle --no-compile true
```

## Configuration

To keep deployment results and deploy only modified contracts, add the `lockFile` property to deployment:

```ts
config.deployment = {
  lockFile: "deployment-lock.json",
  config: {
    // contracts..
  },
};
```

To deploy contracts as a proxy:

```ts
import { SupportedProxies } from "@dgma/hardhat-sol-bundler";

config.deployment = {
  lockFile: "deployment-lock.json",
  config: {
    TestContract: {
      proxy: {
        type: SupportedProxies.TRANSPARENT,
      },
    },
  },
};
```

SupportedProxies.TRANSPARENT and SupportedProxies.UUPS proxies can be added directly to proxied contract configuration.
hardhat-upgrades module will automatically manage the creation of ERC1967 proxy contract and upgrade logic.

For manual and separate deployment of Proxy contract and Implementation contract, SupportedProxies.CUSTOM should be used.

## Plugins

Simple deployment result logging:

```ts
import { Logging } from "@dgma/hardhat-sol-bundler/plugins/Logging";

config.deployment = {
  plugins: [Logging],
  config: {
    // contracts..
  },
};
```

Verify deployed contracts:

```ts
// no need @nomicfoundation/hardhat-verify if you use @nomicfoundation/hardhat-toolbox
import "@nomicfoundation/hardhat-verify";
import { VerifyPlugin } from "@dgma/hardhat-sol-bundler/plugins/Verify";

config.deployment = {
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

The library can be easily extended with custom plugins by adding them to `deployment.plugins` list. A simple example of the plugins can be found in `plugins/*`.

During deployment, sol-bundler can execute additional logic implemented as lifecycle hooks:

```
BEFORE_CONTEXT_INITIALIZATION - fires once, before deployment runtime context creation;
BEFORE_DEPLOYMENT - fires once, after deployment runtime context creation and before deployment logic initiation;

BEFORE_DEPENDENCY_RESOLUTION - fires for each contract in the config, before resolving dynamically contract dependencies (arguments and libraries);

BEFORE_CONTRACT_BUILD - fires for each contract in the config, before creating contract factory;
AFTER_CONTRACT_BUILD - fires for each contract in the config, after creating contract factory;

BEFORE_CONTRACT_DEPLOY - fires for each contract in the config, before contract deployment;
AFTER_CONTRACT_DEPLOY - fires for each contract in the config, after contract deployment;

AFTER_CONTEXT_SERIALIZATION: "AFTER_CONTEXT_SERIALIZATION" - fires for each contract in the config, after deployment runtime context serialization (preparation for storing output into lock file);

AFTER_DEPLOYMENT - fires once, after all contracts deployment;
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
