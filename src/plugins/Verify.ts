import { TASK_VERIFY_VERIFY } from "@nomicfoundation/hardhat-verify/internal/task-names";
import {
  Hooks,
  getDeployment,
  type HookFn,
  type ILockContract,
  type IDeployingContractState,
} from "../";

const afterContractSerialization: HookFn = async (
  hre,
  state,
  contractState,
) => {
  const { verify, config } = getDeployment(hre);
  const cst = contractState?.value() as IDeployingContractState;
  const contractCtx = state?.value().ctx[cst.name] as ILockContract;
  if (
    (verify && config[cst.name].verify !== false) ||
    config[cst.name].verify === true
  ) {
    return hre.run(TASK_VERIFY_VERIFY, {
      address: contractCtx.address,
      constructorArguments: contractCtx.args,
    });
  }
};

export const VerifyPlugin = {
  [Hooks.AFTER_CONTEXT_SERIALIZATION]: afterContractSerialization,
};
