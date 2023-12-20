"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const beforeContractBuild = async (hre, state) => {
    const { externals } = (0, __1.getDeployment)(hre);
    if (externals) {
        const externalsCtx = {};
        for (const externalKey of Object.keys(externals)) {
            const { abi, address } = externals[externalKey];
            externalsCtx[externalKey] = {
                ...externals[externalKey],
            };
            if (abi) {
                externalsCtx[externalKey].interface = (await hre.ethers.getContractAt(abi, address)).interface;
            }
        }
        state?.update((prevState) => ({
            ...prevState,
            ctx: {
                ...prevState.ctx,
                externals: externalsCtx,
            },
        }));
    }
};
exports.default = {
    [__1.Hooks.BEFORE_CONTRACT_BUILD]: beforeContractBuild,
};
