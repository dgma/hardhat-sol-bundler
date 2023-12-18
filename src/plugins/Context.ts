import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import {
  type DeploymentContext,
  type Lib,
  type ConstructorArgument,
  type DynamicConstructorArgument,
  type ILockContract,
  type IDeploymentConfig,
} from "../../types/deployment";
import * as PluginsManager from "../PluginsManager";
import {
  composeFromEntires,
  getLock,
  getDeployment,
  type ILimitedHardhatRuntimeEnvironment,
} from "../utils";

const getLibrariesDynamically = async (
  hre: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
  libs: Lib = {},
) => {
  const libraries: Record<string, string> = {};
  for (const libName of Object.keys(libs)) {
    const getter = libs[libName];
    libraries[libName] =
      typeof getter === "function" ? await getter(hre, ctx) : getter;
  }
  return libraries;
};

const getArgsDynamically = async (
  hre: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
  args: (ConstructorArgument | DynamicConstructorArgument)[] = [],
) => {
  const argsRequests = args.map(async (arg) => {
    if (typeof arg === "function") {
      return arg(hre, ctx);
    }
    return arg;
  });
  return Promise.all(argsRequests);
};

interface CreateDeploymentContextParams {
  lock: DeploymentContext;
  config: IDeploymentConfig["config"];
}

function createDeploymentContext({
  lock,
  config,
}: CreateDeploymentContextParams) {
  const result = Object.entries(lock)
    // remove those who was deleted from config
    .filter(([contractKey]) => !!config[contractKey]);

  return composeFromEntires<ILockContract>(result);
}

const Context: PluginsManager.IPlugin = {
  [PluginsManager.Hooks.BEFORE_DEPLOYMENT]: (hre, state) => {
    const { config, lockFile } = getDeployment(
      hre as ILimitedHardhatRuntimeEnvironment,
    );

    const lock = lockFile ? getLock(lockFile) : {};
    const ctx = createDeploymentContext({
      lock: lock[hre?.network?.name as string],
      config,
    });
    state?.update((prevState) => ({ ...prevState, ctx }));
  },

  [PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY]: async (
    _,
    state,
    contractState,
  ) => {
    const cst = contractState?.value();
    if (cst) {
      const ctxUpdate: Partial<ILockContract> = {
        address: await cst?.contract?.getAddress(),
        interface: cst?.contract?.interface,
        factoryByteCode: cst?.factory?.bytecode,
        args: cst.constructorArguments,
      };

      state?.update((prevState) => ({
        ...prevState,
        ctx: {
          ...prevState.ctx,
          [cst.name]: ctxUpdate,
        },
      }));
    }
  },

  [PluginsManager.Hooks.BEFORE_CONTRACT_BUILD]: async (
    hre,
    state,
    contractState,
  ) => {
    const ctx = state?.value().ctx;
    const { config } = getDeployment(hre as ILimitedHardhatRuntimeEnvironment);

    const contractConfig: IDeploymentConfig["config"] =
      config[contractState?.value().name as string];

    if (config) {
      const factoryOptions = {
        libraries: await getLibrariesDynamically(
          hre,
          ctx,
          contractConfig?.options?.libs,
        ),
      };
      const constructorArguments = await getArgsDynamically(
        hre,
        ctx,
        contractConfig?.args,
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
