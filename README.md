# sol-bundler
Build, update and redeploy smartcontracts with hardhat with one config
sol-bundler tracks contract changes and redeploys only those where any changes were made

## Installation
run `npm install @dgma/sol-bundler`
## Usage
1. Create deployment config
```js
module.exports = {
  // contract key = contract name
  TestLibrary: {},
  TestContract: {
    libs: ["TestLibrary"],
    // deployment args passed during contract construction.
    deploymentArgs: ["hello"]
  },
}
```
2. Write deployment script
```js
const { solBundler } = require('@dgma/sol-bundler');
const deploymentConfig = require('deployment.config');

const deploy = () => solBundler({
  deploymentConfig,
})
```
In case you want to deploy all contracts each time even if they weren't changed:
```js
const deploy = () => solBundler({
  noLockFile: true,
  deploymentConfig,
})
```