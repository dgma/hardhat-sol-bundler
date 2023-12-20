import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IGlobalState } from "./types";
export default function deploy(hre: HardhatRuntimeEnvironment): Promise<IGlobalState | undefined>;
