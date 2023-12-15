const fs = require("fs");
const PluginsManager = require("../PluginsManager");
const { getLock, getDeployment } = require("../utils");

const Lock = {
  [PluginsManager.Hooks.AFTER_DEPLOYMENT]: (hre, state) => {
    const { lockfile } = getDeployment(hre);

    if (lockfile) {
      const lock = getLock(lockfile);

      const newLock = {
        ...lock,
        [hre.network.name]: {
          ...lock[hre.network.name],
          ...state.value().ctx,
        },
      };

      fs.writeFileSync(lockfile, JSON.stringify(newLock));
    }
  },
};

module.exports = Lock;
