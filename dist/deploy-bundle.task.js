"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const main_1 = __importDefault(require("./main"));
const DEPLOY_BUNDLE_TASK = "deploy-bundle";
(0, config_1.task)(DEPLOY_BUNDLE_TASK, "Build and deploys smart contracts").setAction(async (_, hre) => (0, main_1.default)(hre));
