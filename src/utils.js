const fs = require("fs");

const I = (val) => val;

const composeFromEntires = (entries = Object.entries({}), valueMapper = I) =>
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
  I,
  composeFromEntires,
  getLock,
  getDeployment,
};
