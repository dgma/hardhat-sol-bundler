import { TASK_VERIFY_VERIFY } from "@nomicfoundation/hardhat-verify/internal/task-names";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IDeployingContractState, type IGlobalState } from "../";
import * as stateFabric from "../state";
import { VerifyPlugin } from "./Verify";

/**
 * Plugin import everything from ./src, so we need to mock hh task module
 */
jest.mock("hardhat/config", () => ({
  ...jest.requireActual("hardhat/config"),
  task: () => ({
    setAction: () => ({}),
  }),
}));

describe("VerifyPlugin", () => {
  const mockRun = jest.fn();

  const expectedVerificationArgs = {
    address: "0xContract",
    constructorArguments: ["hello"],
  };

  const globalState = stateFabric.create<IGlobalState>({
    ctx: {
      Contract: {
        address: expectedVerificationArgs.address,
        args: expectedVerificationArgs.constructorArguments,
      },
    },
    deployedContracts: ["Contract"],
  });

  const contractState = stateFabric.create<IDeployingContractState>({
    name: "Contract",
    factoryOptions: {},
    constructorArguments: expectedVerificationArgs.constructorArguments,
  });

  const createHre = (globalVerify?: boolean, contractVerify?: boolean) =>
    ({
      network: {
        name: "unit",
      } as HardhatRuntimeEnvironment["network"],
      run: mockRun as HardhatRuntimeEnvironment["run"],
      userConfig: {
        networks: {
          unit: {
            deployment: {
              verify: globalVerify,
              config: {
                Contract: {
                  verify: contractVerify,
                },
              },
            },
          },
        },
      } as HardhatRuntimeEnvironment["userConfig"],
    }) as HardhatRuntimeEnvironment;

  afterEach(() => {
    mockRun.mockClear();
  });

  it("should verify if deployment.verify=true contract.verify=undefined", async () => {
    const hre = createHre(true);
    await VerifyPlugin.AFTER_CONTEXT_SERIALIZATION(
      hre,
      globalState,
      contractState,
    );
    expect(mockRun).toHaveBeenCalledWith(
      TASK_VERIFY_VERIFY,
      expectedVerificationArgs,
    );
  });

  it("should verify if deployment.verify=false contract.verify=true", async () => {
    const hre = createHre(false, true);
    await VerifyPlugin.AFTER_CONTEXT_SERIALIZATION(
      hre,
      globalState,
      contractState,
    );
    expect(mockRun).toHaveBeenCalledWith(
      TASK_VERIFY_VERIFY,
      expectedVerificationArgs,
    );
  });

  it("should not verify if deployment.verify=true contract.verify=false", async () => {
    const hre = createHre(true, false);
    await VerifyPlugin.AFTER_CONTEXT_SERIALIZATION(
      hre,
      globalState,
      contractState,
    );
    expect(mockRun).not.toHaveBeenCalled();
  });
});
