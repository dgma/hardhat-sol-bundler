import { task } from "hardhat/config";
import { default as solBundler } from "./main";

const DEPLOY_BUNDLE_TASK = "deploy-bundle";

task(DEPLOY_BUNDLE_TASK, "Build and deploys smart contracts").setAction(
  async (_, hre) => solBundler(hre),
);
