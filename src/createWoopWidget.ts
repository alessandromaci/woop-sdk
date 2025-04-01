import type { WoopWidgetParams } from "./types";

export async function createWoopWidget(
  container: HTMLElement,
  params: WoopWidgetParams
) {
  // Build base iframe URL
  const baseUrl = "http://localhost:3000/widgetext"; // In development
  const query = new URLSearchParams({
    appCode: params.appCode,
    assets: params.assets.join(","),
    modules: JSON.stringify(params.modules),
    networks: JSON.stringify(params.networks || {}),
    theme: params.theme || "light",
    buttonColor: params.buttonColor || "#4B6BFB",
    logo: params.logo || "",
  }).toString();

  const iframeUrl = `${baseUrl}?${query}`;

  // Create and configure the iframe
  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "600px"; // Increased height for better UX
  iframe.style.border = "1px solid #E5E7EB"; // Subtle border
  iframe.style.borderRadius = "16px"; // Rounded corners
  iframe.style.boxShadow =
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"; // Subtle shadow
  iframe.id = "woop-widget-frame";

  // Clear container and append iframe
  container.innerHTML = "";
  container.appendChild(iframe);

  // Function to send wallet info to iframe
  const sendWalletInfo = async () => {
    if (!params.provider) {
      console.error("No provider available");
      return;
    }

    try {
      const provider = params.provider; // Capture provider in local scope

      // Get the current address - should already be available since we're in a wallet
      const accounts = await provider.request({
        method: "eth_accounts",
      });
      const address = accounts?.[0];

      if (!address) {
        console.error("No address available");
        return;
      }

      // Get the chain ID
      const chainId = await provider.request({
        method: "eth_chainId",
      });

      // Send the provider, address and chainId to the iframe
      iframe.contentWindow?.postMessage(
        {
          type: "WOOP_CONNECT",
          payload: {
            address,
            chainId,
            provider: {
              request: async (args: any) => provider.request(args),
              on: provider.on?.bind(provider),
              removeListener: provider.removeListener?.bind(provider),
              isMetaMask: provider.isMetaMask,
              isCoinbaseWallet: provider.isCoinbaseWallet,
            },
          },
        },
        "http://localhost:3000"
      );
    } catch (err) {
      console.error("Failed to get wallet info:", err);
    }
  };

  // Send wallet info as soon as iframe is loaded
  iframe.addEventListener("load", sendWalletInfo);

  // Also listen for any reconnection requests (though they shouldn't be needed)
  window.addEventListener("message", async (event) => {
    if (event.origin !== "http://localhost:3000") return;

    const { type } = event.data;
    if (type === "CONNECT_WALLET") {
      await sendWalletInfo();
    }
  });
}
