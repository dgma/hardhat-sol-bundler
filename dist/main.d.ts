import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
export default function solBundler(hre: HardhatRuntimeEnvironment): Promise<import("./deploy").IGlobalState | undefined>;
