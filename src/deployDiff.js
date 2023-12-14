const PluginsManager = require("./PluginsManager");
const { getDeployment } = require("./utils");

module.exports = async function deployDiff(hre) {
  const state = {
    hre,
    ctx: {},
    deployedContracts: [],
  };

  await PluginsManager.on(PluginsManager.Hooks.BEFORE_DEPLOYMENT, state);

  await Object.keys(getDeployment(hre).config).reduce(
    (promise, contractToDeploy) =>
      promise.then(async () => {
        state.currentContract = {
          name: contractToDeploy,
          factoryOptions: {},
          constructorArguments: [],
        };

        await PluginsManager.on(
          PluginsManager.Hooks.BEFORE_CONTRACT_BUILD,
          state
        );

        state.currentContract.factory = await hre.ethers.getContractFactory(
          state.currentContract.name,
          state.currentContract.factoryOptions
        );

        await PluginsManager.on(
          PluginsManager.Hooks.AFTER_CONTRACT_BUILD,
          state
        );

        const isSameByteCode =
          state.currentContract.factory.bytecode ===
          state.ctx[contractToDeploy]?.factoryByteCode;

        const isSameArguments =
          JSON.stringify(state.currentContract.constructorArguments) ===
          JSON.stringify(state.ctx[contractToDeploy]?.args);

        if (isSameByteCode && isSameArguments) return;

        await PluginsManager.on(
          PluginsManager.Hooks.BEFORE_CONTRACT_DEPLOY,
          state
        );

        state.currentContract.contract =
          await state.currentContract.factory.deploy(
            ...state.currentContract.constructorArguments
          );

        await state.currentContract.contract.waitForDeployment();

        await PluginsManager.on(
          PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY,
          state
        );

        state.deployedContracts.push(contractToDeploy);
      }),
    Promise.resolve({})
  );

  await PluginsManager.on(PluginsManager.Hooks.AFTER_DEPLOYMENT, state);

  return state;
};
