"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPlugin = void 0;
const task_names_1 = require("@nomicfoundation/hardhat-verify/internal/task-names");
const __1 = require("../");
const afterContractSerialization = async (hre, state, contractState) => {
    const { verify, config } = (0, __1.getDeployment)(hre);
    const cst = contractState?.value();
    const contractCtx = state?.value().ctx[cst.name];
    if ((verify && config[cst.name].verify !== false) ||
        config[cst.name].verify === true) {
        return hre.run(task_names_1.TASK_VERIFY_VERIFY, {
            address: contractCtx.address,
            constructorArguments: contractCtx.args,
        });
    }
};
exports.VerifyPlugin = {
    [__1.Hooks.AFTER_CONTEXT_SERIALIZATION]: afterContractSerialization,
};
