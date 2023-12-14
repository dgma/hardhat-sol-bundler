const { expect } = require("chai");
const { solBundler } = require("../index");

describe("solBundler", () => {
  it("should deploy contracts based on config file", async () => {
    const { ctx, deployedContracts } = await solBundler(hre);
    expect(deployedContracts).to.eql(["TestLibrary", "TestContract"]);
    expect(ctx).to.have.property("TestContract");
    expect(ctx).to.have.property("TestLibrary");
  });
});
