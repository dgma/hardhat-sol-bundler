const { expect } = require("chai");
const { main } = require("../index");

describe("main", () => {
  it("should deploy contracts based on config file", async () => {
    const { ctx, deployedContracts } = await main(hre);
    expect(deployedContracts).to.eql(["TestLibrary", "TestContract"]);
    expect(ctx).to.have.property("TestContract");
    expect(ctx).to.have.property("TestLibrary");
  });
});
