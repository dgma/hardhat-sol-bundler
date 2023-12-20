"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDeployment = exports.getDeployment = exports.getLock = void 0;
const fs_1 = __importDefault(require("fs"));
const getLock = (lockfileName) => {
    if (fs_1.default.existsSync(lockfileName)) {
        return JSON.parse(fs_1.default.readFileSync(lockfileName, { encoding: "utf8" }));
    }
    return {};
};
exports.getLock = getLock;
const getDeployment = (hre) => {
    return (hre.userConfig.networks?.[hre.network.name]?.deployment ?? {
        config: {},
    });
};
exports.getDeployment = getDeployment;
const saveDeployment = async (hre, state) => {
    const { lockFile } = (0, exports.getDeployment)(hre);
    if (lockFile) {
        const lock = (0, exports.getLock)(lockFile);
        const newLock = {
            ...lock,
            [hre?.network?.name]: {
                ...state?.value().ctx,
            },
        };
        fs_1.default.writeFileSync(lockFile, JSON.stringify(newLock));
    }
};
exports.saveDeployment = saveDeployment;
