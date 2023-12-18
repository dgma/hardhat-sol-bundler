import fs from "fs";
import { Hooks, type HookFn } from "../../plugins";
import {
  getLock,
  getDeployment,
  type ILimitedHardhatRuntimeEnvironment,
} from "../utils";

const afterDeployment: HookFn = async (hre, state) => {
  const { lockFile } = getDeployment(hre as ILimitedHardhatRuntimeEnvironment);

  if (lockFile) {
    const lock = getLock(lockFile);

    const newLock = {
      ...lock,
      [hre?.network?.name as string]: {
        ...state?.value().ctx,
      },
    };

    fs.writeFileSync(lockFile, JSON.stringify(newLock));
  }
};

export default {
  [Hooks.AFTER_DEPLOYMENT]: afterDeployment,
};
