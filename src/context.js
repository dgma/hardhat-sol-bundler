const { composeFromEntires } = require("./utils");

module.exports = async function createDeploymentContext(
  deploymentMetaData = {},
  deploymentConfig = {}
) {
  const promises = Object.entries(deploymentMetaData)
    // remove those who was deleted from config
    .filter(([contractKey]) => !!deploymentConfig[contractKey])
    .map(async ([contractKey, value]) => {
      const name = deploymentConfig[contractKey].name;
      return [
        contractKey,
        {
          ...value,
          interface: (await ethers.getContractAt(name, value.address))
            .interface,
        },
      ];
    });

  const result = await Promise.all(promises);

  return composeFromEntires(result);
}