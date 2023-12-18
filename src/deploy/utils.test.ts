import { getDeployment, type ILimitedHardhatRuntimeEnvironment } from "./utils";

describe("getDeployment", () => {
  it("should return deployment with empty config by default", () => {
    expect(
      getDeployment({
        network: {
          name: "hardhat",
        },
        userConfig: { networks: {} },
      }).config,
    ).toEqual({});
  });

  it("should return deployment for network", () => {
    const hardhatDeploymentMockConfig = {
      SomeContract: {
        args: ["hardhatDeploymentMockConfig"],
      },
    };
    const mockHre: ILimitedHardhatRuntimeEnvironment = {
      network: {
        name: "hardhat",
      },
      userConfig: {
        networks: {
          hardhat: {
            deployment: {
              config: hardhatDeploymentMockConfig,
            },
          },
          random: {
            deployment: {
              config: {
                OtherContract: {},
              },
            },
          },
        },
      },
    };
    expect(getDeployment(mockHre).config).toEqual(hardhatDeploymentMockConfig);
  });
});
