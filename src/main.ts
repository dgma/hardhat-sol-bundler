import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { deploy, getDeployment } from "./deploy";
import { ILogger, simpleLogger, defaultLogger } from "./logger";
import { PluginsManager } from "./pluginsManager";

export default async function solBundler(
  hre: HardhatRuntimeEnvironment,
  logger: ILogger = simpleLogger,
) {
  const log = { ...defaultLogger, ...logger };
  const plugins = getDeployment(hre)?.plugins || [];

  PluginsManager.registerPlugins(plugins);

  const { ctx, deployedContracts } = await deploy(hre);

  log.info(
    `Deployment log: ${JSON.stringify(
      deployedContracts.reduce(
        (acc, contractKey) => ({
          ...acc,
          [contractKey]: {
            contractName: ctx[contractKey].contractName,
            address: ctx[contractKey].address,
          },
        }),
        {},
      ),
      null,
      "  ",
    )}`,
  );

  return { ctx, deployedContracts };
}
