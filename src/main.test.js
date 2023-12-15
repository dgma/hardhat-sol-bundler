const main = require("./main");
const { A } = require("./utils");

const mockGetDeployment = jest.fn(() => ({
  plugins: ["customPlugin"],
}));
const mockRegisterPlugins = jest.fn();
const mockDeploy = jest.fn(() => ({ ctx: "ctx" }));

jest.mock("./utils", () => ({
  getDeployment: (...args) => mockGetDeployment(...args),
}));
jest.mock("./plugins", () => ["plugin1", "plugin2"]);
jest.mock("./PluginsManager", () => ({
  registerPlugins: (...args) => mockRegisterPlugins(...args),
}));
jest.mock("./deploy", () => ({
  deploy: (...args) => mockDeploy(...args),
}));

describe("main", () => {
  const hre = {};

  it("should read plugins from config", async () => {
    await main(hre);
    expect(mockGetDeployment).toBeCalledWith(hre);
  });
  it("should register plugins with internal first", async () => {
    await main(hre);
    expect(mockRegisterPlugins).toBeCalledWith([
      "plugin1",
      "plugin2",
      "customPlugin",
    ]);
  });

  it("should return deploy execution result", async () => {
    const result = await main(hre);
    expect(result).toEqual({ ctx: "ctx" });
    expect(mockDeploy).toBeCalledWith(hre);
  });
});
