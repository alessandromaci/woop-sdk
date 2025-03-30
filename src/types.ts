export interface WoopWidgetParams {
  // Core required parameters
  appCode: string;
  assets: string[];

  // Module configuration
  modules: {
    enableReceive: boolean;
    enableInvest: boolean;
    enableNFTs: boolean;
  };

  // Network configuration
  provider?: any; // will later extend this to EIP-1193
  networks?: {
    mainnet?: boolean;
    sepolia?: boolean;
    polygon?: boolean;
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
  isMetaMask?: boolean; // Optional: for common wallet detection
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isFrame?: boolean;
  [key: string]: any; // Fallback for other props
}

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string; // URL or base64
  };
  provider: EthereumProvider;
}
