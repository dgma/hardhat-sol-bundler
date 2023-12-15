const solBundler = require("./solBundler");

const mockGetDeployment = jest.fn(() => ({
  plugins: ["customPlugin"],
}));
const mockRegisterPlugins = jest.fn();
const mockDeployDiff = jest.fn(() => ({ ctx: "ctx" }));

jest.mock("./utils", () => ({
  getDeployment: (...args) => mockGetDeployment(...args),
}));
jest.mock("./plugins", () => ["plugin1", "plugin2"]);
jest.mock("./PluginsManager", () => ({
  registerPlugins: (...args) => mockRegisterPlugins(...args),
}));
jest.mock(
  "./deployDiff",
  () =>
    (...args) =>
      mockDeployDiff(...args)
);

describe("solBundler", () => {
  const hre = {};

  it("should read plugins from config", async () => {
    await solBundler(hre);
    expect(mockGetDeployment).toBeCalledWith(hre);
  });
  it("should register plugins with internal first", async () => {
    await solBundler(hre);
    expect(mockRegisterPlugins).toBeCalledWith([
      "plugin1",
      "plugin2",
      "customPlugin",
    ]);
  });

  it("should return deployDiff execution result", async () => {
    const result = await solBundler(hre);
    expect(result).toEqual({ ctx: "ctx" });
    expect(mockDeployDiff).toBeCalledWith(hre);
  });
});
