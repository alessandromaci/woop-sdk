export interface WidgetConfig {
  /** Your unique application identifier */
  appCode: string;

  /** EIP-1193 compatible wallet provider */
  provider: any;

  /** List of supported assets */
  assets: string[];

  /** Enable/disable specific modules */
  modules?: {
    enableReceive?: boolean;
    enableInvest?: boolean;
    enableNFTs?: boolean;
  };

  /** Configure supported networks */
  networks?: {
    mainnet?: boolean;
    sepolia?: boolean;
    optimism?: boolean;
    arbitrum?: boolean;
    base?: boolean;
  };

  /** UI theme */
  theme?: "light" | "dark";

  /** Custom button color */
  buttonColor?: string;

  /** Custom logo URL */
  logo?: string;
}

export interface WidgetInstance {
  /** Destroy the widget instance */
  destroy: () => void;

  /** Update widget configuration */
  updateConfig: (config: Partial<WidgetConfig>) => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
