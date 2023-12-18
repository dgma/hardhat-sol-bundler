import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks, PluginsManager } from "../plugins";
import * as stateFabric from "../state";
import { type IGlobalState, type IDeployingContractState } from "./types";
import { getDeployment, type ILimitedHardhatRuntimeEnvironment } from "./utils";

export async function deploy(hre: HardhatRuntimeEnvironment) {
  const state = stateFabric.create<IGlobalState>({
    ctx: {},
    deployedContracts: [],
  });

  await PluginsManager.on(Hooks.BEFORE_DEPLOYMENT, hre, state);

  for (const contractToDeploy of Object.keys(
    getDeployment(hre as ILimitedHardhatRuntimeEnvironment).config,
  )) {
    const contractState = stateFabric.create<IDeployingContractState>({
      name: contractToDeploy,
      factoryOptions: {},
      constructorArguments: [],
    });

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

    if (isSameByteCode && isSameArguments) return;

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

    state.update((prevState) => ({
      ...prevState,
      deployedContracts: state
        .value()
        .deployedContracts.concat(contractToDeploy),
    }));
  }

  await PluginsManager.on(Hooks.AFTER_DEPLOYMENT, hre, state);

  return state.value();
}
