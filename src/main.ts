import { deploy } from "./deploy";
import InternalPlugins from "./plugins";
import * as PluginsManager from "./PluginsManager";
import { getDeployment } from "./utils";

module.exports = async function solBundler(hre) {
  const plugins = getDeployment(hre)?.plugins || [];

  PluginsManager.registerPlugins(InternalPlugins.concat(plugins));

  return deploy(hre);
};
