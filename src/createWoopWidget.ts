import type { WoopWidgetParams } from "./types";

export async function createWoopWidget(
  container: HTMLElement,
  params: WoopWidgetParams
) {
  // Function to convert image URL to data URL
  const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
    try {
      // Create a canvas element
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create a promise to handle image loading
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.crossOrigin = "anonymous"; // Enable CORS
        img.src = imageUrl;
      });

      // Wait for image to load
      await imageLoadPromise;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas and convert to data URL
      ctx?.drawImage(img, 0, 0);
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.warn("Failed to convert image to data URL:", error);
      return ""; // Return empty string on error
    }
  };

  // Convert logo to data URL if it exists
  let logoDataUrl = "";
  if (params.logo) {
    logoDataUrl = await convertImageToDataUrl(params.logo);
  }

  // Build base iframe URL
  const baseUrl = "http://localhost:3000/widgetext"; // In development
  const query = new URLSearchParams({
    appCode: params.appCode,
    assets: params.assets.join(","),
    modules: JSON.stringify(params.modules),
    networks: JSON.stringify(params.networks || {}),
    theme: params.theme || "light",
    buttonColor: params.buttonColor || "#4B6BFB",
    logo: logoDataUrl || "", // Use the data URL instead of direct URL
  }).toString();

  const iframeUrl = `${baseUrl}?${query}`;

  // Create and configure the iframe
  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.maxWidth = "380px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.margin = "0";
  iframe.style.padding = "0";
  iframe.style.display = "block";
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
