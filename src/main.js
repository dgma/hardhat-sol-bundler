const { deploy } = require("./deploy");
const PluginsManager = require("./PluginsManager");
const InternalPlugins = require("./plugins");
const { getDeployment } = require("./utils");

module.exports = async function solBundler(hre) {
  const plugins = getDeployment(hre)?.plugins || [];

  PluginsManager.registerPlugins(InternalPlugins.concat(plugins));

  return deploy(hre);
};
