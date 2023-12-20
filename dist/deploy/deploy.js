"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pluginsManager_1 = require("../pluginsManager");
const stateFabric = __importStar(require("../state"));
const Context = __importStar(require("./context"));
const utils_1 = require("./utils");
async function deploy(hre) {
    const state = stateFabric.create({
        ctx: {},
        deployedContracts: [],
    });
    await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.BEFORE_CONTEXT_INITIALIZATION, hre, state);
    await Context.init(hre, state);
    await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.BEFORE_DEPLOYMENT, hre, state);
    for (const contractToDeploy of Object.keys((0, utils_1.getDeployment)(hre).config)) {
        const contractState = stateFabric.create({
            name: contractToDeploy,
            factoryOptions: {},
            constructorArguments: [],
        });
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.BEFORE_DEPENDENCY_RESOLUTION, hre, state, contractState);
        await Context.resolveDeps(hre, state, contractState);
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.BEFORE_CONTRACT_BUILD, hre, state, contractState);
        const factory = await hre?.ethers?.getContractFactory(contractState.value().name, contractState.value().factoryOptions);
        contractState.update((prevState) => ({
            ...prevState,
            factory,
        }));
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.AFTER_CONTRACT_BUILD, hre, state, contractState);
        const isSameByteCode = contractState.value()?.factory?.bytecode ===
            state.value().ctx[contractToDeploy]?.factoryByteCode;
        const isSameArguments = JSON.stringify(contractState.value().constructorArguments) ===
            JSON.stringify(state.value().ctx[contractToDeploy]?.args);
        if (isSameByteCode && isSameArguments)
            return;
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.BEFORE_CONTRACT_DEPLOY, hre, state, contractState);
        const contract = await contractState
            .value()
            ?.factory?.deploy(...contractState.value().constructorArguments);
        await contract?.waitForDeployment();
        contractState.update((prevState) => ({
            ...prevState,
            contract,
        }));
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.AFTER_CONTRACT_DEPLOY, hre, state, contractState);
        await Context.serialize(hre, state, contractState);
        await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.AFTER_CONTEXT_SERIALIZATION, hre, state, contractState);
        state.update((prevState) => ({
            ...prevState,
            deployedContracts: state
                .value()
                .deployedContracts.concat(contractToDeploy),
        }));
    }
    await pluginsManager_1.PluginsManager.on(pluginsManager_1.Hooks.AFTER_DEPLOYMENT, hre, state);
    await (0, utils_1.saveDeployment)(hre, state);
    return state.value();
}
exports.default = deploy;
