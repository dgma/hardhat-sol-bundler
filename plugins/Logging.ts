import { Hooks, type HookFn, type IGlobalState } from "../src";

const logDeployment: HookFn = async (hre, state) => {
  const st = state?.value() as IGlobalState;
  console.log(
    `Deployment log: ${JSON.stringify(
      st.deployedContracts.reduce(
        (acc, contractKey) => ({
          ...acc,
          [contractKey]: {
            contractName: st.ctx[contractKey].contractName,
            address: st.ctx[contractKey].address,
          },
        }),
        {},
      ),
      null,
      "  ",
    )}`,
  );
};

export const LoggingPlugin = {
  [Hooks.AFTER_DEPLOYMENT]: logDeployment,
};
