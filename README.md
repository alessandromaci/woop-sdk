# Woop SDK

The Woop SDK allows you to easily integrate the Woop widget into your application. It provides a seamless way to handle wallet connections and manage crypto payments across different networks.

## Installation

```bash
npm install @woopwidget/sdk
# or
yarn add @woopwidget/sdk
```

## Prerequisites

Before integrating the Woop widget, ensure you have:

1. A web3 wallet provider (like MetaMask, WalletConnect, etc.)
2. Basic understanding of:
   - Wallet connections
   - Chain IDs and networks
   - JSON-RPC requests
   - Iframe communication

## Integration Guide

### Basic Integration (Plain JavaScript)

Here's a simple implementation that works with any wallet provider:

```javascript
// Initialize the widget
const widget = new WoopWidget("woop-widget", {
  appCode: "YOUR-APP-CODE",
  getAddress: () => window.ethereum.selectedAddress, // Get current wallet address
  getChainId: () => window.ethereum.chainId, // Get current chain ID
  makeRpcRequest: async (method, params) => {
    return await window.ethereum.request({ method, params });
  },
});

// Example usage
document.addEventListener("DOMContentLoaded", () => {
  // Check if wallet is connected
  if (window.ethereum && window.ethereum.isConnected()) {
    widget.initialize();
  } else {
    console.log("Please connect your wallet");
  }
});
```

### TypeScript Integration

For TypeScript users, here's a more type-safe implementation:

```typescript
class WoopWidget {
  private iframeRef: HTMLIFrameElement | null = null;
  private element: HTMLElement;

  constructor(
    elementId: string,
    config: {
      appCode: string;
      getAddress: () => string;
      getChainId: () => string | number;
      makeRpcRequest: (method: string, params?: any) => Promise<any>;
    }
  ) {
    this.element = document.getElementById(elementId)!;
    this.initialize(config);
  }

  private initialize(config: any) {
    try {
      // Create a provider that matches the expected interface
      const provider = {
        request: async ({
          method,
          params,
        }: {
          method: string;
          params?: any;
        }) => {
          return config.makeRpcRequest(method, params);
        },
      };

      // Initialize the widget
      createWoopWidget(this.element, {
        appCode: config.appCode,
        provider,
        assets: ["USDC", "ETH", "WBTC"],
        modules: {
          enableReceive: true,
          enableInvest: true,
          enableNFTs: true,
        },
        networks: {
          ethereum: true,
          sepolia: true,
        },
        theme: "light",
        buttonColor: "#000000",
      });

      // Store iframe reference
      this.iframeRef = this.element.querySelector("iframe");

      // Setup communication
      this.setupCommunication(config);
    } catch (error) {
      console.error("Error initializing WoopWidget:", error);
    }
  }

  private setupCommunication(config: any) {
    // Send initial connection info
    const sendWalletInfo = () => {
      if (this.iframeRef?.contentWindow) {
        const address = config.getAddress();
        const chainId = config.getChainId();

        // Convert chainId to hex if it's a number
        const formattedChainId =
          typeof chainId === "number" ? `0x${chainId.toString(16)}` : chainId;

        this.iframeRef.contentWindow.postMessage(
          {
            type: "WOOP_CONNECT",
            payload: {
              address,
              chainId: formattedChainId,
              provider: { type: "PROVIDER_PROXY" },
            },
          },
          "*"
        );
      }
    };

    // Send on iframe load
    if (this.iframeRef) {
      this.iframeRef.addEventListener("load", sendWalletInfo);
    }

    // Initial send
    sendWalletInfo();

    // Retry to ensure connection
    [500, 1000].forEach((delay) => {
      setTimeout(sendWalletInfo, delay);
    });

    // Example of handling wallet state changes
    // Replace with your wallet's event system
    return {
      onAddressChange: (newAddress: string) => {
        sendWalletInfo();
      },
      onChainChange: (newChainId: string) => {
        sendWalletInfo();
      },
    };
  }
}

// Usage Example
const widget = new WoopWidget("woop-widget", {
  appCode: "YOUR-APP-CODE",
  getAddress: () => wallet.getCurrentAddress(), // Replace with your wallet's method
  getChainId: () => wallet.getCurrentChainId(), // Replace with your wallet's method
  makeRpcRequest: (method, params) => wallet.request(method, params), // Replace with your wallet's RPC method
});
```

### React + Wagmi Integration

If you're building a web3 application (rather than a wallet), you might want to use Wagmi for wallet connections. Here's how:

```typescript
import React, { useEffect, useRef } from "react";
import { createWoopWidget } from "@woopwidget/sdk";
import { usePublicClient, useAccount } from "wagmi";

const WoopWidget: React.FC = () => {
  const provider = usePublicClient();
  const { isConnected, address, chainId } = useAccount();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Function to send wallet info
  const sendWalletInfo = () => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow && address && chainId) {
      iframe.contentWindow.postMessage(
        {
          type: "WOOP_CONNECT",
          payload: {
            address,
            chainId:
              typeof chainId === "number"
                ? `0x${chainId.toString(16)}`
                : chainId,
            provider: { type: "PROVIDER_PROXY" },
          },
        },
        "*"
      );
    }
  };

  useEffect(() => {
    const element = document.getElementById("woop-widget");
    if (element && isConnected && provider && address && chainId) {
      try {
        // Create widget first
        createWoopWidget(element, {
          appCode: "YOUR-APP-CODE",
          provider: provider,
          assets: ["USDC", "ETH", "WBTC"],
          modules: {
            enableReceive: true,
            enableInvest: true,
            enableNFTs: true,
          },
          networks: {
            ethereum: true,
            sepolia: true,
          },
          theme: "light",
          buttonColor: "#000000",
        });

        // Store reference to iframe
        iframeRef.current = element.querySelector("iframe");

        // Send initial wallet info
        sendWalletInfo();

        // Retry a few times in case the first attempt fails
        [500, 1000].forEach((delay) => {
          setTimeout(sendWalletInfo, delay);
        });
      } catch (error) {
        console.error("Error initializing WoopWidget:", error);
      }
    }
  }, [provider, isConnected, address, chainId]);

  if (!isConnected || !address) {
    return <div>Please connect your wallet to use the widget</div>;
  }

  return <div id="woop-widget" />;
};

export default WoopWidget;
```

### Configuration Options

| Option      | Type     | Required | Description                                | Default   |
| ----------- | -------- | -------- | ------------------------------------------ | --------- |
| appCode     | string   | Yes      | Your unique application identifier         | -         |
| provider    | object   | Yes      | Object implementing the provider interface | -         |
| assets      | string[] | Yes      | Supported assets (USDC, ETH, WBTC, etc.)   | -         |
| modules     | object   | No       | Feature toggles for widget modules         | See below |
| networks    | object   | No       | Supported networks configuration           | See below |
| theme       | string   | No       | UI theme ('light', 'dark')                 | "light"   |
| buttonColor | string   | No       | Custom button color (hex)                  | "#000000" |

#### Provider Interface

```typescript
interface Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}
```

#### Modules Configuration

```typescript
{
  enableReceive: boolean, // Enable receive functionality
  enableInvest: boolean,  // Enable investment features
  enableNFTs: boolean     // Enable NFT features
}
```

#### Networks Configuration

```typescript
{
  ethereum: boolean,  // Ethereum mainnet
  sepolia: boolean,  // Sepolia Ethereum testnet
  optimism: boolean, // Optimism
  arbitrum: boolean, // Arbitrum
  base: boolean      // Base
}
```

## Important Implementation Notes

1. **Wallet Integration Requirements**

   - Ability to get current wallet address
   - Ability to get current chain ID
   - Method to make JSON-RPC requests
   - Optional: Way to listen for address/chain changes

2. **Iframe Communication**

   - The widget runs in an iframe and requires message passing
   - Use `postMessage` to send wallet connection info
   - Handle iframe load events to ensure proper initialization

3. **Chain ID Format**

   - Chain IDs should be sent in hex format (e.g., "0x1" for Ethereum mainnet)
   - Convert numeric chain IDs to hex before sending
   - Ensure consistent chain ID format across all communications

4. **Error Handling**
   - Implement proper error handling for widget initialization
   - Handle cases where the wallet is not connected
   - Provide user feedback for connection states

## Troubleshooting

Common issues and solutions:

1. **Widget shows "Waiting for wallet connection"**

   - Ensure wallet is connected before initializing widget
   - Verify `WOOP_CONNECT` message is being sent
   - Check iframe communication is working

2. **Address not showing in widget**

   - Confirm address is being sent in `WOOP_CONNECT` payload
   - Verify chainId format (should be hex string)
   - Check for any console errors

3. **Network selection issues**
   - Ensure networks are properly configured
   - Verify chainId is being properly converted to hex
   - Check network compatibility with selected assets

## Support

For support and APP_CODE request, please contact:

- Email: hello@woop.ink
- Website: https://www.woopwidget.com/

## License

MIT
