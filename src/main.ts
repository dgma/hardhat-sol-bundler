import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { deploy, getDeployment, internalPlugins } from "./deploy";
import { PluginsManager } from "./plugins";

export default async function solBundler(hre: HardhatRuntimeEnvironment) {
  const plugins = getDeployment(hre)?.plugins || [];

  PluginsManager.registerPlugins(internalPlugins.concat(plugins));

  return deploy(hre);
}
