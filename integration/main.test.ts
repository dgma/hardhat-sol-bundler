import { expect } from "chai";
import hre from "hardhat";
import { type IGlobalState, solBundler } from "../src";

describe("main", () => {
  it("should deploy contracts based on config file", async () => {
    const { ctx, deployedContracts } = (await solBundler(hre)) as IGlobalState;
    expect(deployedContracts).to.eql(["TestLibrary", "TestContract"]);
    expect(ctx).to.have.property("TestContract");
    expect(ctx).to.have.property("TestLibrary");
  });
});
