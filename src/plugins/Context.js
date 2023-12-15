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
  [PluginsManager.Hooks.BEFORE_DEPLOYMENT]: async (hre, state) => {
    const { config, lockfile } = getDeployment(hre);

    const lock = lockfile ? getLock(lockfile) : {};
    const ctx = await createDeploymentContext({
      hre,
      lock: lock[hre.network.name] || {},
      config,
    });
    state.update((prevState) => ({ ...prevState, ctx }));
  },

  [PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY]: async (
    _,
    state,
    contractState
  ) => {
    const ctxUpdate = {
      [contractState.value().name]: {
        address: await contractState.value().contract.getAddress(),
        interface: contractState.value().contract.interface,
        factoryByteCode: contractState.value().factory.bytecode,
        args: contractState.value().constructorArguments,
      },
    };

    state.update((prevState) => ({
      ...prevState,
      ctx: {
        ...prevState.ctx,
        ...ctxUpdate,
      },
    }));
  },

  [PluginsManager.Hooks.BEFORE_CONTRACT_BUILD]: async (
    hre,
    state,
    contractState
  ) => {
    const ctx = state.value().ctx;
    const { config } = getDeployment(hre);

    const contractConfig = config[contractState.value().name];

    if (config) {
      const factoryOptions = {
        libraries: await getLibrariesDynamically(
          hre,
          ctx,
          contractConfig?.options?.libs
        ),
      };
      const constructorArguments = await getArgsDynamically(
        hre,
        ctx,
        contractConfig?.args
      );

      contractState.update((prevState) => ({
        ...prevState,
        factoryOptions,
        constructorArguments,
      }));
    }
  },
};

module.exports = Context;
