import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IState } from "../state/types";
import {
  type DeploymentContext,
  type Lib,
  type ConstructorArgument,
  type DynamicConstructorArgument,
  type ILockContract,
  type IDeploymentConfig,
  type IGlobalState,
  type IDeployingContractState,
} from "./types";
import { getLock, getDeployment } from "./utils";

export type ContextManipulator = (
  hre: HardhatRuntimeEnvironment,
  state?: IState<IGlobalState>,
  contractState?: IState<IDeployingContractState>,
) => Promise<void>;

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
  lock = {},
  config,
}: CreateDeploymentContextParams) {
  const ctx: DeploymentContext = {};

  for (const contractKey of Object.keys(lock)) {
    const contract = lock[contractKey];
    if (config[contractKey]) {
      ctx[contractKey] = {
        ...contract,
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

export const init: ContextManipulator = async (hre, state) => {
  const { config, lockFile } = getDeployment(hre);

  const lock = lockFile ? getLock(lockFile)[hre.network.name] : {};

  const ctx = await createDeploymentContext({
    hre,
    lock,
    config,
  });
  state?.update((prevState) => ({ ...prevState, ctx }));
};

export const serialize: ContextManipulator = async (
  _,
  state,
  contractState,
) => {
  const cst = contractState?.value();
  if (cst) {
    const ctxUpdate: Partial<ILockContract> = {
      address: await cst?.contract?.getAddress(),
      abi: cst?.contract?.interface?.fragments,
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

export const resolveDeps: ContextManipulator = async (
  hre,
  state,
  contractState,
) => {
  const ctx = state?.value().ctx;
  const { config } = getDeployment(hre);

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
