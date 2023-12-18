import "hardhat/types/runtime";
import "hardhat/types/config";
import { type IDeploymentConfig } from "../deploy";

declare module "hardhat/types/config" {
  interface HardhatNetworkUserConfig {
    chainId?: number;
    from?: string;
    gas?: "auto" | number;
    gasPrice?: "auto" | number;
    gasMultiplier?: number;
    initialBaseFeePerGas?: number;
    hardfork?: string;
    mining?: HardhatNetworkMiningUserConfig;
    accounts?: HardhatNetworkAccountsUserConfig;
    blockGasLimit?: number;
    minGasPrice?: number | string;
    throwOnTransactionFailures?: boolean;
    throwOnCallFailures?: boolean;
    allowUnlimitedContractSize?: boolean;
    allowBlocksWithSameTimestamp?: boolean;
    initialDate?: string;
    loggingEnabled?: boolean;
    forking?: HardhatNetworkForkingUserConfig;
    coinbase?: string;
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
    accounts?: HttpNetworkAccountsUserConfig;
    deployment?: IDeploymentConfig;
  }
}
