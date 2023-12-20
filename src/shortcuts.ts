import { type DynamicLibrary } from "./deploy";

export const dynamicAddress: (contractName: string) => DynamicLibrary =
  (contractName) => (_, ctx) =>
    ctx[contractName].address as string;

export const dynamicExternalAddress: (contractName: string) => DynamicLibrary =
  (contractName: string) => (_, ctx) =>
    ctx.externals?.[contractName]?.address as string;
