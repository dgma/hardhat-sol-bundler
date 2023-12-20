"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deploy_1 = require("./deploy");
const pluginsManager_1 = require("./pluginsManager");
async function solBundler(hre) {
    const plugins = (0, deploy_1.getDeployment)(hre)?.plugins || [];
    pluginsManager_1.PluginsManager.registerPlugins(plugins);
    return (0, deploy_1.deploy)(hre);
}
exports.default = solBundler;
