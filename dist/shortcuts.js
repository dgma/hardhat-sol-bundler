"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicExternalAddress = exports.dynamicAddress = void 0;
const dynamicAddress = (contractName) => (_, ctx) => ctx[contractName].address;
exports.dynamicAddress = dynamicAddress;
const dynamicExternalAddress = (contractName) => (_, ctx) => ctx.externals?.[contractName]?.address;
exports.dynamicExternalAddress = dynamicExternalAddress;
