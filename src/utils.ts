import fs from "fs";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";

const I = (val: any) => val;

const composeFromEntires = (entries = Object.entries({}), valueMapper = I) =>
  entries.reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: valueMapper(value),
    }),
    {},
  );

const getLock = (lockfileName: string) => {
  if (fs.existsSync(lockfileName)) {
    return JSON.parse(fs.readFileSync(lockfileName, { encoding: "utf8" }));
  }
  return {};
};

const getDeployment = (hre: any) => {
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
