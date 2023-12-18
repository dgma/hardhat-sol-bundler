import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import * as PluginsManager from "../PluginsManager";
import {
  type DeploymentContext,
  type Lib,
  type ConstructorArgument,
  type DynamicConstructorArgument,
  type ILockContract,
  type IDeploymentConfig,
} from "../declarations/deployment";
import {
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
  hre: HardhatRuntimeEnvironment;
  lock: DeploymentContext;
  config: IDeploymentConfig["config"];
}

async function createDeploymentContext({
  hre,
  lock,
  config,
}: CreateDeploymentContextParams) {
  const ctx: DeploymentContext = {};

  for (const contractKey of Object.keys(lock)) {
    const contract = lock[contractKey];
    if (config[contractKey]) {
      ctx[contractKey] = {
        ...config[contractKey],
        interface: (
          await hre.ethers.getContractAt(
            contractKey,
            contract.address as string,
          )
        ).interface,
      };
    }
  }

  return ctx;
}

const beforeDeployment: PluginsManager.HookFn = async (hre, state) => {
  const { config, lockFile } = getDeployment(
    hre as ILimitedHardhatRuntimeEnvironment,
  );

  const lock = lockFile ? getLock(lockFile) : {};
  const ctx = await createDeploymentContext({
    hre,
    lock: lock[hre?.network?.name as string],
    config,
  });
  state?.update((prevState) => ({ ...prevState, ctx }));
};

const afterContractDeploy: PluginsManager.HookFn = async (
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
};

const beforeContractBuild: PluginsManager.HookFn = async (
  hre,
  state,
  contractState,
) => {
  const ctx = state?.value().ctx;
  const { config } = getDeployment(hre as ILimitedHardhatRuntimeEnvironment);

  const contractConfig = config[contractState?.value().name as string];

  if (contractConfig && ctx) {
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

    contractState?.update((prevState) => ({
      ...prevState,
      factoryOptions,
      constructorArguments,
    }));
  }
};

export default {
  [PluginsManager.Hooks.BEFORE_DEPLOYMENT]: beforeDeployment,

  [PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY]: afterContractDeploy,

  [PluginsManager.Hooks.BEFORE_CONTRACT_BUILD]: beforeContractBuild,
};
