import { Hooks, getDeployment, type HookFn, Externals } from "../";

const beforeContractBuild: HookFn = async (hre, state) => {
  const { externals } = getDeployment(hre);
  if (externals) {
    const externalsCtx: Externals = {};
    for (const externalKey of Object.keys(externals)) {
      const { abi, address } = externals[externalKey];
      externalsCtx[externalKey] = {
        ...externals[externalKey],
      };
      if (abi) {
        externalsCtx[externalKey].interface = (
          await hre.ethers.getContractAt(abi as any[], address)
        ).interface;
      }
    }

    state?.update((prevState) => ({
      ...prevState,
      ctx: {
        ...prevState.ctx,
        externals: externalsCtx,
      },
    }));
  }
};

export default {
  [Hooks.BEFORE_CONTRACT_BUILD]: beforeContractBuild,
};
