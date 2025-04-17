# Woop SDK

The Woop SDK allows you to easily integrate the Woop widget into your application, providing a seamless way to connect with various wallets and manage assets.

## Installation

```bash
npm install @woop/sdk
# or
yarn add @woop/sdk
```

## Quick Start

```javascript
import { createWoopWidget } from "@woop/sdk";

// Initialize the widget
createWoopWidget(document.getElementById("woop-widget"), {
  appCode: "YOUR-APP-CODE",
  provider: window.ethereum, // Your wallet provider
  assets: ["USDC", "ETH", "WBTC"],
});
```

## Configuration Options

| Option      | Type     | Required | Description                         |
| ----------- | -------- | -------- | ----------------------------------- |
| appCode     | string   | Yes      | Your unique application identifier  |
| provider    | object   | Yes      | EIP-1193 compatible wallet provider |
| assets      | string[] | Yes      | List of supported assets            |
| modules     | object   | No       | Enable/disable specific modules     |
| networks    | object   | No       | Configure supported networks        |
| theme       | string   | No       | UI theme ('light' or 'dark')        |
| buttonColor | string   | No       | Custom button color                 |
| logo        | string   | No       | Custom logo URL                     |

## Examples

### React Integration

```jsx
import { useEffect } from "react";
import { createWoopWidget } from "@woop/sdk";
import { useAccount, useProvider } from "wagmi";

function WidgetComponent() {
  const { isConnected } = useAccount();
  const provider = useProvider();

  useEffect(() => {
    if (isConnected && provider) {
      createWoopWidget(document.getElementById("woop-widget"), {
        appCode: "YOUR-APP-CODE",
        provider: provider,
        assets: ["USDC", "ETH", "WBTC"],
      });
    }
  }, [isConnected, provider]);

  return <div id="woop-widget" />;
}
```

### React Native Integration

```jsx
import React, { useEffect, useRef } from "react";
import { WebView } from "react-native-webview";

const WebViewScreen = () => {
  const webViewRef = useRef(null);

  const onLoadEnd = () => {
    const jsCode = `
      window.ethereum = new MyWalletProvider();
    `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: "YOUR-WIDGET-URL" }}
      onLoadEnd={onLoadEnd}
    />
  );
};
```

## Wallet Integration

The SDK supports any EIP-1193 compatible wallet provider. Here are some common integrations:

### RainbowKit

```jsx
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <YourApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
```

### MetaMask

```javascript
if (typeof window.ethereum !== "undefined") {
  const provider = window.ethereum;
  createWoopWidget(document.getElementById("woop-widget"), {
    appCode: "YOUR-APP-CODE",
    provider: provider,
    assets: ["USDC", "ETH", "WBTC"],
  });
}
```

## Events

The widget emits the following events:

```javascript
provider.on("accountsChanged", (accounts) => {
  // Handle account changes
});

provider.on("chainChanged", (chainId) => {
  // Handle chain changes
});
```

## Error Handling

```javascript
try {
  createWoopWidget(document.getElementById("woop-widget"), {
    // ... config
  });
} catch (error) {
  console.error("Failed to initialize widget:", error);
  // Handle error appropriately
}
```

## Troubleshooting

Common issues and solutions:

1. **Widget not loading**

   - Check if the container element exists
   - Verify the provider is properly initialized
   - Ensure all required configuration options are provided

2. **Wallet connection issues**

   - Verify the provider implements EIP-1193
   - Check network connectivity
   - Ensure the wallet is properly installed and unlocked

3. **Asset display issues**
   - Verify the asset symbols are correct
   - Check if the assets are supported on the current network
   - Ensure proper network configuration

## Support

For support, please contact:

- Email: hello@woop.ink
- Telegram: Join our [Telegram community](https://t.me/woop_pay)
- Website: https://www.woopwidget.com/

## License

MIT
