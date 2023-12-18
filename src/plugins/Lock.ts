import fs from "fs";
import * as PluginsManager from "../PluginsManager";
import {
  getLock,
  getDeployment,
  type ILimitedHardhatRuntimeEnvironment,
} from "../utils";

export const Lock: PluginsManager.IPlugin = {
  [PluginsManager.Hooks.AFTER_DEPLOYMENT]: (hre, state) => {
    const { lockFile } = getDeployment(
      hre as ILimitedHardhatRuntimeEnvironment,
    );

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
  },
};
