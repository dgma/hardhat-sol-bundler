"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicAddress = void 0;
const dynamicAddress = (contractName) => (_, ctx) => ctx[contractName].address;
exports.dynamicAddress = dynamicAddress;
