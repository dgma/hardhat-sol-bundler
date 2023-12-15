const fs = require("fs");

const identity = (val) => val;

const composeFromEntires = (
  entries = Object.entries({}),
  valueMapper = identity
) =>
  entries.reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: valueMapper(value),
    }),
    {}
  );

const getLock = (lockfileName) => {
  if (fs.existsSync(lockfileName)) {
    return JSON.parse(fs.readFileSync(lockfileName, { encoding: "utf8" }));
  }
  return {};
};

const getDeployment = (hre) => {
  return (
    hre?.userConfig?.networks?.[hre.network.name]?.deployment || {
      config: {},
    }
  );
};

module.exports = {
  identity,
  composeFromEntires,
  getLock,
  getDeployment,
};
