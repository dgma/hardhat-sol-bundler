import { expect } from "chai";
import hre from "hardhat";
import { solBundler, type ILogger } from "../src";

describe("main", () => {
  it("should deploy contracts based on config file", async () => {
    const { ctx, deployedContracts } = await solBundler(hre, {} as ILogger);
    expect(deployedContracts).to.eql([
      "TestLibrary",
      "TestTransparentUpgradable",
      "testUUPSUpgradable",
      "TestContractFirst",
      "TestContractSecond",
    ]);
    expect(Object.keys(ctx)).to.eql(deployedContracts);
  });
});
