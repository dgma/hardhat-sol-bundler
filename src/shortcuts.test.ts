import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type DeploymentContext } from "./deploy";
import { dynamicAddress } from "./shortcuts";

describe("dynamicAddress", () => {
  const contractName = "TestContract";
  const hre = {} as HardhatRuntimeEnvironment;
  const ctx = {
    [contractName]: {
      address: "0xContractName",
    },
  } as DeploymentContext;
  it("should return address from deployed contract", () => {
    expect(dynamicAddress(contractName)(hre, ctx)).toBe("0xContractName");
  });
});
