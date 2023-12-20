"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDeps = exports.serialize = exports.init = void 0;
const utils_1 = require("./utils");
const getLibrariesDynamically = async (hre, ctx, libs = {}) => {
    const libraries = {};
    for (const libName of Object.keys(libs)) {
        const getter = libs[libName];
        libraries[libName] =
            typeof getter === "function" ? await getter(hre, ctx) : getter;
    }
    return libraries;
};
const getArgsDynamically = async (hre, ctx, args = []) => {
    const argsRequests = args.map(async (arg) => {
        if (typeof arg === "function") {
            return arg(hre, ctx);
        }
        return arg;
    });
    return Promise.all(argsRequests);
};
async function createDeploymentContext({ hre, lock = {}, config, }) {
    const ctx = {};
    for (const contractKey of Object.keys(lock)) {
        const contract = lock[contractKey];
        if (config[contractKey]) {
            ctx[contractKey] = {
                ...contract,
                interface: (await hre.ethers.getContractAt(contractKey, contract.address)).interface,
            };
        }
    }
    return ctx;
}
const init = async (hre, state) => {
    const { config, lockFile } = (0, utils_1.getDeployment)(hre);
    const lock = lockFile ? (0, utils_1.getLock)(lockFile)[hre.network.name] : {};
    const ctx = await createDeploymentContext({
        hre,
        lock,
        config,
    });
    state?.update((prevState) => ({ ...prevState, ctx }));
};
exports.init = init;
const serialize = async (_, state, contractState) => {
    const cst = contractState?.value();
    if (cst) {
        const ctxUpdate = {
            address: await cst?.contract?.getAddress(),
            abi: cst?.contract?.interface?.fragments,
            factoryByteCode: cst?.factory?.bytecode,
            args: cst.constructorArguments,
        };
        state?.update((prevState) => ({
            ...prevState,
            ctx: {
                ...prevState.ctx,
                [cst.name]: ctxUpdate,
            },
        }));
    }
};
exports.serialize = serialize;
const resolveDeps = async (hre, state, contractState) => {
    const ctx = state?.value().ctx;
    const { config } = (0, utils_1.getDeployment)(hre);
    const contractConfig = config[contractState?.value().name];
    if (contractConfig && ctx) {
        const factoryOptions = {
            libraries: await getLibrariesDynamically(hre, ctx, contractConfig?.options?.libs),
        };
        const constructorArguments = await getArgsDynamically(hre, ctx, contractConfig?.args);
        contractState?.update((prevState) => ({
            ...prevState,
            factoryOptions,
            constructorArguments,
        }));
    }
};
exports.resolveDeps = resolveDeps;
