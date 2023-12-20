import { type DynamicLibrary } from "./deploy";

export const dynamicAddress: (contractName: string) => DynamicLibrary =
  (contractName) => (_, ctx) =>
    ctx[contractName].address as string;
