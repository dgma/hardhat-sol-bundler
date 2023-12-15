const PluginsManager = require("../PluginsManager");
const { composeFromEntires, getLock, getDeployment } = require("../utils");

const getLibrariesDynamically = async (hre, ctx, libs = {}) => {
  const promises = Object.entries(libs).map(async ([libName, getter]) => {
    return [
      libName,
      typeof getter === "function" ? await getter(hre, ctx) : getter,
    ];
  });
  const resolvedLibs = await Promise.all(promises);
  return composeFromEntires(resolvedLibs);
};

const getArgsDynamically = async (hre, ctx, args = []) => {
  const argsRequests = args.map(async (arg) => {
    if (typeof arg === "function") {
      return arg(hre, ctx);
    }
    return arg;
  });
  return Promise.all(argsRequests);
};

async function createDeploymentContext({ hre, lock, config }) {
  const promises = Object.entries(lock)
    // remove those who was deleted from config
    .filter(([contractKey]) => !!config[contractKey])
    .map(async ([contract, value]) => [
      contract,
      {
        ...value,
        interface: (await hre.ethers.getContractAt(contract, value.address))
          .interface,
      },
    ]);

  const result = await Promise.all(promises);

  return composeFromEntires(result);
}

const Context = {
  [PluginsManager.Hooks.BEFORE_DEPLOYMENT]: async (params) => {
    const { hre } = params;
    const { config, lockfile } = getDeployment(hre);

    const lock = lockfile ? getLock(lockfile) : {};

    // mutation
    params.ctx = await createDeploymentContext({
      hre,
      lock: lock[hre.network.name] || {},
      config,
    });
  },
  [PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY]: async (params) => {
    const { currentContract } = params;

    // mutation
    params.ctx[currentContract.name] = {
      address: await currentContract.contract.getAddress(),
      interface: currentContract.contract.interface,
      factoryByteCode: currentContract.factory.bytecode,
      args: currentContract.constructorArguments,
    };
  },
  [PluginsManager.Hooks.BEFORE_CONTRACT_BUILD]: async (params) => {
    const { hre, ctx } = params;
    const { config } = getDeployment(hre);

    const contractConfig = config[params.currentContract.name];

    if (config) {
      params.currentContract.factoryOptions = {
        libraries: await getLibrariesDynamically(
          hre,
          ctx,
          contractConfig?.options?.libs
        ),
      };
      params.currentContract.constructorArguments = await getArgsDynamically(
        hre,
        ctx,
        contractConfig?.args
      );
    }
  },
};

module.exports = Context;
