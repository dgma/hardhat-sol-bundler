const fs = require("fs");
const { composeFromEntires } = require('./utils');

const defaultLockFileName = "deploymentContext-lock.json";

const getDeploymentMetadata = (lockfileName = defaultLockFileName) => {
  if (fs.existsSync(lockfileName)) {
    return JSON.parse(fs.readFileSync(lockfileName, { encoding: "utf8" }));
  }
  return {};
};

function saveDeploymentMetadataLockFile({
  deploymentMetaData,
  newDeploymentContext,
  network,
  lockfileName = defaultLockFileName,
}) {

  const newMetaDataFromDeploymentContext = composeFromEntires(
    Object.entries(newDeploymentContext),
    value => ({
      address: value.address,
      factoryByteCode: value.factoryByteCode,
    })
  )

  const newMetaData = {
    ...deploymentMetaData,
    [network.name]: {
      ...deploymentMetaData[network.name],
      ...newMetaDataFromDeploymentContext,
    },
  };

  fs.writeFileSync(lockfileName, JSON.stringify(newMetaData));

  return newMetaData;
}

module.exports = {
  getDeploymentMetadata,
  saveDeploymentMetadataLockFile,
}