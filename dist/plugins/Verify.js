"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPlugin = void 0;
const task_names_1 = require("@nomicfoundation/hardhat-verify/internal/task-names");
const __1 = require("../");
const verifyDeployedContracts = async (hre, state) => {
    const { verify, config } = (0, __1.getDeployment)(hre);
    const st = state?.value();
    await Promise.all(st.deployedContracts.map(async (deployedContractName) => {
        const contractCtx = st.ctx[deployedContractName];
        if ((verify && config[deployedContractName].verify !== false) ||
            config[deployedContractName].verify === true) {
            try {
                await hre.run(task_names_1.TASK_VERIFY_VERIFY, {
                    address: contractCtx.address,
                    constructorArguments: contractCtx.args,
                });
            }
            catch (error) {
                console.error("verification failed, safely continue");
                console.error(error.message);
            }
        }
    }));
};
exports.VerifyPlugin = {
    [__1.Hooks.AFTER_DEPLOYMENT]: verifyDeployedContracts,
};
