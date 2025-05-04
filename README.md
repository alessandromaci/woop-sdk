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

### ⚡️ Important: Async Initialization & App Code Validation

- `createWoopWidget` is now **async** and must be awaited.
- The widget validates your `appCode` via an API call before rendering. If validation fails, the widget will not be created.
- Always check for the iframe after awaiting widget creation before sending wallet info.

### Basic Integration (Plain JavaScript)

```javascript
(async () => {
  const element = document.getElementById("woop-widget");
  if (element && window.ethereum) {
    try {
      await createWoopWidget(element, {
        appCode: "YOUR-APP-CODE",
        provider: window.ethereum,
        assets: ["USDC", "ETH", "WBTC"],
        modules: { enableReceive: true, enableInvest: true, enableNFTs: true },
        networks: { ethereum: true, sepolia: true },
        theme: "light",
        buttonColor: "#000000",
      });
      // Now the iframe is present, you can send wallet info
      const iframe = element.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "WOOP_CONNECT",
            payload: {
              address: window.ethereum.selectedAddress,
              chainId: window.ethereum.chainId,
              provider: { type: "PROVIDER_PROXY" },
            },
          },
          "*"
        );
      }
    } catch (error) {
      console.error("Error initializing WoopWidget:", error);
    }
  }
})();
```

### TypeScript Integration

```typescript
async function initializeWoopWidget(elementId: string, config: any) {
  const element = document.getElementById(elementId);
  if (!element) return;
  try {
    await createWoopWidget(element, config);
    // Now the iframe is present, you can send wallet info
    const iframe = element.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "WOOP_CONNECT",
          payload: {
            address: config.getAddress(),
            chainId:
              typeof config.getChainId() === "number"
                ? `0x${config.getChainId().toString(16)}`
                : config.getChainId(),
            provider: { type: "PROVIDER_PROXY" },
          },
        },
        "*"
      );
    }
  } catch (error) {
    console.error("Error initializing WoopWidget:", error);
  }
}
```

### React + Wagmi Integration

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
    const element = document.getElementById("woop-widget");
    const iframe = element ? element.querySelector("iframe") : null;
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
      (async () => {
        try {
          await createWoopWidget(element, {
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
          // Send wallet info
          sendWalletInfo();
        } catch (error) {
          console.error("Error initializing WoopWidget:", error);
        }
      })();
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
| modules     | object   | Yes      | Feature toggles for widget modules         | See below |
| networks    | object   | Yes      | Supported networks configuration           | See below |
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

1. **Async Initialization & App Code Validation**

   - `createWoopWidget` is async and must be awaited.
   - The widget validates your `appCode` via an API call before rendering. If validation fails, the widget will not be created.
   - Always check for the iframe after awaiting widget creation before sending wallet info.

2. **Wallet Integration Requirements**

   - Ability to get current wallet address
   - Ability to get current chain ID
   - Method to make JSON-RPC requests
   - Optional: Way to listen for address/chain changes

3. **Iframe Communication**

   - The widget runs in an iframe and requires message passing
   - Use `postMessage` to send wallet connection info
   - Handle iframe load events to ensure proper initialization

4. **Chain ID Format**

   - Chain IDs should be sent in hex format (e.g., "0x1" for Ethereum mainnet)
   - Convert numeric chain IDs to hex before sending
   - Ensure consistent chain ID format across all communications

5. **Error Handling**
   - Implement proper error handling for widget initialization
   - Handle cases where the wallet is not connected
   - Provide user feedback for connection states
   - If app code validation fails, catch and display the error

## Troubleshooting

Common issues and solutions:

1. **Widget shows "Waiting for wallet connection"**

   - Ensure wallet is connected before initializing widget
   - Verify `WOOP_CONNECT` message is being sent
   - Check iframe communication is working
   - Make sure you await widget creation before sending wallet info

2. **Address not showing in widget**

   - Confirm address is being sent in `WOOP_CONNECT` payload
   - Verify chainId format (should be hex string)
   - Check for any console errors

3. **Network selection issues**

   - Ensure networks are properly configured
   - Verify chainId is being properly converted to hex
   - Check network compatibility with selected assets

4. **App code validation errors**
   - Make sure your app code is valid and registered in the backend
   - If you see an error about invalid app code, check your API and code registration

## Support

For support and APP_CODE request, please contact:

- Email: hello@woop.ink
- Website: https://www.woopwidget.com/

## License

MIT
