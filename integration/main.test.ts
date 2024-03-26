import { expect } from "chai";
import hre from "hardhat";
import { solBundler } from "../src";

describe("main", () => {
  it("should deploy contracts based on config file", async () => {
    const { ctx, deployedContracts } = await solBundler(hre);
    expect(deployedContracts).to.eql([
      "LenLibrary",
      "MockTransparentUpgradable",
      "MockUUPSUpgradable",
      "MockContractFirst",
      "MockContractSecond",
    ]);
    expect(Object.keys(ctx)).to.eql(deployedContracts);
  });
});
