export interface WoopWidgetParams {
  // Core required parameters
  appCode: string;
  assets: string[];
  provider?: EthereumProvider;

  // Module configuration
  modules: {
    enableReceive: boolean;
    enableInvest: boolean;
    enableNFTs: boolean;
  };

  // Network configuration
  networks?: {
    mainnet?: boolean;
    sepolia?: boolean;
    optimism?: boolean;
    arbitrum?: boolean;
    base?: boolean;
  };

  // UI/Theme configuration
  theme?: "light" | "dark" | "system";
  buttonColor?: string;
  logo?: string;
}

export interface JsonRpcRequest {
  method: string;
  params?: unknown[];
}

export interface EthereumProvider {
  request<T = any>(args: JsonRpcRequest): Promise<T>;
  on?(event: string, callback: (...args: any[]) => void): void;
  removeListener?(event: string, callback: (...args: any[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isFrame?: boolean;
  [key: string]: any;
}
