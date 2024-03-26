import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { deploy, getDeployment } from "./deploy";
import { PluginsManager } from "./pluginsManager";

export default async function solBundler(hre: HardhatRuntimeEnvironment) {
  const plugins = getDeployment(hre)?.plugins || [];

  PluginsManager.registerPlugins(plugins);

  return await deploy(hre);
}
