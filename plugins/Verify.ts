import { TASK_VERIFY_VERIFY } from "@nomicfoundation/hardhat-verify/internal/task-names";
import {
  Hooks,
  getDeployment,
  type HookFn,
  type ILockContract,
  type IGlobalState,
} from "../src";

const verifyDeployedContracts: HookFn = async (hre, state) => {
  const { verify, config } = getDeployment(hre);
  const st = state?.value() as IGlobalState;
  await Promise.all(
    st.deployedContracts.map(async (deployedContractName) => {
      const contractCtx = st.ctx[deployedContractName] as ILockContract;
      if (
        (verify && config[deployedContractName].verify !== false) ||
        config[deployedContractName].verify === true
      ) {
        try {
          await hre.run(TASK_VERIFY_VERIFY, {
            address: contractCtx.address,
            constructorArguments: contractCtx.args,
          });
        } catch (error) {
          console.error("verification failed, safely continue");
          console.error((error as any).message);
        }
      }
    }),
  );
};

export const VerifyPlugin = {
  [Hooks.AFTER_DEPLOYMENT]: verifyDeployedContracts,
};
