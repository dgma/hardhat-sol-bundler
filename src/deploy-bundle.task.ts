import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import { default as solBundler } from "./main";

const DEPLOY_BUNDLE_TASK = "deploy-bundle";

task(DEPLOY_BUNDLE_TASK, "Build and deploys smart contracts")
  .addOptionalParam("noCompile", "Don't compile before running this task")
  .setAction(async ({ noCompile }, hre) => {
    if (!noCompile) {
      await hre.run(TASK_COMPILE);
    }
    return solBundler(hre);
  });
