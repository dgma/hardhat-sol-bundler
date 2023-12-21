import "hardhat/types/runtime";
import "hardhat/types/config";
import { type IDeploymentConfig } from "./deploy";

declare module "hardhat/types/config" {
  interface HardhatNetworkUserConfig {
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;
    initialBaseFeePerGas?: number;
    hardfork?: string;
    // eslint-disable-next-line no-undef
    mining?: HardhatNetworkMiningUserConfig;
    // eslint-disable-next-line no-undef
    accounts?: HardhatNetworkAccountsUserConfig;
    blockGasLimit?: number;
    minGasPrice?: number | string;
    throwOnTransactionFailures?: boolean;
    throwOnCallFailures?: boolean;
    allowUnlimitedContractSize?: boolean;
    allowBlocksWithSameTimestamp?: boolean;
    initialDate?: string;
    loggingEnabled?: boolean;
    // eslint-disable-next-line no-undef
    forking?: HardhatNetworkForkingUserConfig;
    coinbase?: string;
    // eslint-disable-next-line no-undef
    chains?: HardhatNetworkChainsUserConfig;
    enableTransientStorage?: boolean;
    deployment?: IDeploymentConfig;
  }

  export interface HttpNetworkUserConfig {
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;
    url?: string;
    timeout?: number;
    httpHeaders?: { [name: string]: string };
    // eslint-disable-next-line no-undef
    accounts?: HttpNetworkAccountsUserConfig;
    deployment?: IDeploymentConfig;
  }
}
