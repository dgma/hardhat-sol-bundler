import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks, PluginsManager } from "../pluginsManager";
import * as stateFabric from "../state";
import * as Context from "./context";
import { type IGlobalState, type IDeployingContractState } from "./types";
import { getDeployment, saveDeployment } from "./utils";

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const state = stateFabric.create<IGlobalState>({
    ctx: {},
    deployedContracts: [],
  });

  await PluginsManager.on(Hooks.BEFORE_CONTEXT_INITIALIZATION, hre, state);

  await Context.init(hre, state);

  await PluginsManager.on(Hooks.BEFORE_DEPLOYMENT, hre, state);

  for (const contractToDeploy of Object.keys(getDeployment(hre).config)) {
    const contractState = stateFabric.create<IDeployingContractState>({
      name: contractToDeploy,
      factoryOptions: {},
      constructorArguments: [],
    });

    await PluginsManager.on(
      Hooks.BEFORE_DEPENDENCY_RESOLUTION,
      hre,
      state,
      contractState,
    );

    await Context.resolveDeps(hre, state, contractState);

    await PluginsManager.on(
      Hooks.BEFORE_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );

    const factory = await hre?.ethers?.getContractFactory(
      contractState.value().name,
      contractState.value().factoryOptions,
    );

    contractState.update((prevState) => ({
      ...prevState,
      factory,
    }));

    await PluginsManager.on(
      Hooks.AFTER_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );

    const isSameByteCode =
      contractState.value()?.factory?.bytecode ===
      state.value().ctx[contractToDeploy]?.factoryByteCode;

    const isSameArguments =
      JSON.stringify(contractState.value().constructorArguments) ===
      JSON.stringify(state.value().ctx[contractToDeploy]?.args);

    if (isSameByteCode && isSameArguments) continue;

    await PluginsManager.on(
      Hooks.BEFORE_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );

    const contract = await contractState
      .value()
      ?.factory?.deploy(...contractState.value().constructorArguments);

    await contract?.waitForDeployment();

    contractState.update((prevState) => ({
      ...prevState,
      contract,
    }));

    await PluginsManager.on(
      Hooks.AFTER_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );

    await Context.serialize(hre, state, contractState);

    await PluginsManager.on(
      Hooks.AFTER_CONTEXT_SERIALIZATION,
      hre,
      state,
      contractState,
    );

    state.update((prevState) => ({
      ...prevState,
      deployedContracts: state
        .value()
        .deployedContracts.concat(contractToDeploy),
    }));
  }

  await PluginsManager.on(Hooks.AFTER_DEPLOYMENT, hre, state);

  await saveDeployment(hre, state);

  return state.value();
}
