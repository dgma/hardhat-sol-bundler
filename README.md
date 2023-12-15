# sol-bundler
Build, update and redeploy smartcontracts with hardhat with one config
sol-bundler tracks contract changes and redeploys only those where any changes were made

## Installation
run `npm install @dgma/sol-bundler`
## Usage
1. Create deployment config in hardhat
```js
module.exports = {
  networks: {
    hardhat: {
      deployment: {
        // omit lockFile if you want to have a fresh deploy each time
        lockFile: "deployment-lock.json",
        config: {
          TestLibrary: {},
          TestContract: {
            args: ["hello"],
            options: {
              libs: {
                TestLibrary: (_, ctx) => ctx.TestLibrary.address,
              },
            },
          },
        },
      },
    },
  },
};
```
3. Write deployment script/task
```js
const { solBundler } = require('@dgma/sol-bundler');

const deploy = () => solBundler(hre)
```