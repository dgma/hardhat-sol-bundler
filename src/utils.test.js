const { identity, composeFromEntires, getDeployment } = require("./utils");

describe("utils: identity", () => {
  it("should return input", () => {
    expect(identity(10)).toBe(10);
  });
});

describe("composeFromEntires", () => {
  it("should run passed function and update each value for object values", () => {
    const modifier = jest.fn((num) => num + 2);
    const input = Object.entries({
      a: 10,
      b: 20,
    });
    const output = {
      a: 12,
      b: 22,
    };

    expect(composeFromEntires(input, modifier)).toEqual(output);
    expect(modifier).toHaveBeenCalledTimes(2);
  });
});

describe("getDeployment", () => {
  it("should return deployment with empty config by default", () => {
    expect(getDeployment({}).config).toEqual({});
  });

  it("should return deployment for network", () => {
    const hardhatDeploymentMockConfig = {
      key: "hardhatDeploymentMockConfig",
    };
    const mockHre = {
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
                key: "random",
              },
            },
          },
        },
      },
    };
    expect(getDeployment(mockHre).config).toEqual(hardhatDeploymentMockConfig);
  });
});
