const fs = require("fs");
const PluginsManager = require("../PluginsManager");
const { getLock, getDeployment } = require("../utils");

const Context = {
  [PluginsManager.Hooks.AFTER_DEPLOYMENT]: ({ hre, ctx }) => {
    const { lockfile } = getDeployment(hre);

    if (lockfile) {
      const lock = getLock(lockfile);

      const newLock = {
        ...lock,
        [hre.network.name]: {
          ...lock[hre.network.name],
          ...ctx,
        },
      };

      fs.writeFileSync(lockfile, JSON.stringify(newLock));
    }
  },
};

module.exports = Context;
