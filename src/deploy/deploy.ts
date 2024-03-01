import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks, PluginsManager } from "../pluginsManager";
import * as stateFabric from "../state";
import { SupportedProxies } from "./constants";
import * as Context from "./context";
import {
  type IGlobalState,
  type IDeployingContractState,
  type ProxyUnsafeAllow,
} from "./types";
import {
  getDeployment,
  saveDeployment,
  arrayClone,
  stringifyReplacer,
} from "./utils";

type ContractState = stateFabric.IState<IDeployingContractState>;
type GlobalState = stateFabric.IState<IGlobalState>;
type ClassicProxyTypes =
  | typeof SupportedProxies.TRANSPARENT
  | typeof SupportedProxies.UUPS;

async function deployOrUpdateClassic(
  hre: HardhatRuntimeEnvironment,
  state: GlobalState,
  contractState: ContractState,
  unsafeAllow: ProxyUnsafeAllow[],
  kind: ClassicProxyTypes = SupportedProxies.TRANSPARENT,
) {
  const contractLockData = state.value().ctx[contractState.value().key];
  const factory = contractState.value().factory!;
  const initializerArgs = contractState.value().constructorArguments;
  const isFirstTimeDeploy = !contractLockData?.factoryByteCode;
  let contract: IDeployingContractState["contract"];
  if (isFirstTimeDeploy) {
    contract = await hre.upgrades.deployProxy(factory, initializerArgs, {
      unsafeAllow,
      kind,
    });
  } else {
    contract = await hre.upgrades.upgradeProxy(
      contractLockData!.address!,
      factory,
      {
        call: {
          fn: "upgradeCallBack",
          args: initializerArgs,
        },
        unsafeAllow,
      },
    );
  }

  await contract.waitForDeployment();
  contractState.update((prevState) => ({
    ...prevState,
    contract,
  }));
}

async function simpleDeploy(contractState: ContractState) {
  const contract = await contractState
    .value()
    ?.factory?.deploy(...contractState.value().constructorArguments)!;

  await contract.waitForDeployment();

  contractState.update((prevState) => ({
    ...prevState,
    contract,
  }));
}

async function deployOnce(
  _: HardhatRuntimeEnvironment,
  state: GlobalState,
  contractState: ContractState,
) {
  const contractLockData = state.value().ctx[contractState.value().key];
  const isFirstTimeDeploy = !contractLockData?.factoryByteCode;
  if (isFirstTimeDeploy) {
    await simpleDeploy(contractState);
  }
}

export default async function deploy(hre: HardhatRuntimeEnvironment) {
  const state = stateFabric.create<IGlobalState>({
    ctx: {},
    deployedContracts: [],
  });

  await PluginsManager.on(Hooks.BEFORE_CONTEXT_INITIALIZATION, hre, state);

  await Context.init(hre, state);

  await PluginsManager.on(Hooks.BEFORE_DEPLOYMENT, hre, state);

  const config = getDeployment(hre).config;

  try {
    for (const contractToDeploy of Object.keys(config)) {
      const contractState = stateFabric.create<IDeployingContractState>({
        key: contractToDeploy,
        name: config[contractToDeploy].contractName || contractToDeploy,
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

      const factory = await hre.ethers.getContractFactory(
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
        JSON.stringify(
          contractState.value().constructorArguments,
          stringifyReplacer,
        ) ===
        JSON.stringify(
          state.value().ctx[contractToDeploy]?.args,
          stringifyReplacer,
        );

      if (isSameByteCode && isSameArguments) continue;

      await PluginsManager.on(
        Hooks.BEFORE_CONTRACT_DEPLOY,
        hre,
        state,
        contractState,
      );

      switch (config[contractToDeploy]?.proxy?.type) {
        case SupportedProxies.TRANSPARENT:
          await deployOrUpdateClassic(
            hre,
            state,
            contractState,
            arrayClone(config[contractToDeploy]?.proxy?.unsafeAllow),
          );
          break;
        case SupportedProxies.UUPS:
          await deployOrUpdateClassic(
            hre,
            state,
            contractState,
            arrayClone(config[contractToDeploy]?.proxy?.unsafeAllow),
            SupportedProxies.UUPS,
          );
          break;
        case SupportedProxies.CUSTOM:
          await deployOnce(hre, state, contractState);
          break;
        default:
          await simpleDeploy(contractState);
          break;
      }

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
  } catch (error) {
    console.error(
      "Partial deployment success, save current results. Error:",
      error,
    );
  }

  await PluginsManager.on(Hooks.AFTER_DEPLOYMENT, hre, state);

  await saveDeployment(hre, state);

  return state.value();
}
