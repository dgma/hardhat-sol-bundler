import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { default as solBundler } from "./main";
import { type IPlugin } from "./pluginsManager";

const plugin: IPlugin = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockGetDeployment = jest.fn((_: HardhatRuntimeEnvironment) => ({
  plugins: [plugin],
}));
const mockRegisterPlugins = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockDeploy = jest.fn((hre: HardhatRuntimeEnvironment) => ({
  ctx: "ctx",
}));

jest.mock("./deploy", () => ({
  getDeployment: (hre: HardhatRuntimeEnvironment) => mockGetDeployment(hre),
  deploy: (hre: HardhatRuntimeEnvironment) => mockDeploy(hre),
  internalPlugins: [],
}));
jest.mock("./pluginsManager", () => ({
  PluginsManager: {
    registerPlugins: (plugins: IPlugin[]) => mockRegisterPlugins(plugins),
  },
}));

describe("main", () => {
  const hre = {} as HardhatRuntimeEnvironment;

  it("should read plugins from config", async () => {
    await solBundler(hre);
    expect(mockGetDeployment).toHaveBeenCalledWith(hre);
  });
  it("should register plugins with internal first", async () => {
    await solBundler(hre);
    expect(mockRegisterPlugins).toHaveBeenCalledWith([plugin]);
  });

  it("should return deploy execution result", async () => {
    const result = await solBundler(hre);
    expect(result).toEqual({ ctx: "ctx" });
    expect(mockDeploy).toHaveBeenCalledWith(hre);
  });
});
