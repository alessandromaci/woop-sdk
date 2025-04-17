import { WidgetConfig, WidgetInstance } from "./types";

export async function createWoopWidget(
  container: HTMLElement,
  config: WidgetConfig
): Promise<WidgetInstance> {
  // Function to convert image URL to data URL
  const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to data URL:", error);
      return "";
    }
  };

  // Convert logo to data URL if it exists
  let logoDataUrl = "";
  if (config.logo) {
    logoDataUrl = await convertImageToDataUrl(config.logo);
  }

  // Build base iframe URL
  const baseUrl = "http://localhost:3000/widgetext"; // In development
  const query = new URLSearchParams({
    appCode: config.appCode,
    assets: config.assets.join(","),
    modules: JSON.stringify(config.modules),
    networks: JSON.stringify(config.networks || {}),
    theme: config.theme || "light",
    buttonColor: config.buttonColor || "#4B6BFB",
    logo: logoDataUrl || "", // Use the data URL instead of direct URL
  }).toString();

  const iframeUrl = `${baseUrl}?${query}`;

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "550px";
  iframe.style.maxWidth = "380px";
  iframe.style.minHeight = "400px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";

  // Append iframe to container
  container.appendChild(iframe);

  // Function to send wallet info to iframe
  const sendWalletInfo = async () => {
    if (!config.provider) {
      console.error("No provider available");
      return;
    }

    try {
      const provider = config.provider; // Capture provider in local scope

      // Get the current address - should already be available since we're in a wallet
      const accounts = await provider.request({ method: "eth_accounts" });
      const chainId = await provider.request({ method: "eth_chainId" });

      if (accounts.length > 0) {
        const walletInfo = {
          address: accounts[0],
          chainId: chainId,
        };

        // Send wallet info to iframe
        iframe.contentWindow?.postMessage(
          {
            type: "WALLET_INFO",
            payload: walletInfo,
          },
          "*"
        );
      }
    } catch (error) {
      console.error("Error getting wallet info:", error);
    }
  };

  // Listen for messages from iframe
  window.addEventListener("message", (event) => {
    if (event.data.type === "REQUEST_WALLET_INFO") {
      sendWalletInfo();
    }
  });

  return {
    destroy: () => {
      // Cleanup implementation
      container.removeChild(iframe);
      window.removeEventListener("message", sendWalletInfo);
    },
    updateConfig: (newConfig: Partial<WidgetConfig>) => {
      // Update implementation
      // You can implement config updates here
    },
  };
}
