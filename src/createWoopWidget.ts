import { WidgetConfig, WidgetInstance } from "./types";

// Shared variable for the API base URL
const WOOP_API_BASE_URL =
  "https://woop-git-handlewalletconnectionwidget-woop-pay.vercel.app";

export async function createWoopWidget(
  container: HTMLElement,
  config: WidgetConfig
): Promise<WidgetInstance> {
  // Validate appCode via API
  const validateAppCodeViaApi = async (appCode: string): Promise<boolean> => {
    try {
      if (!WOOP_API_BASE_URL) {
        throw new Error(
          "WOOP_API_BASE_URL is not set. Please call setWoopApiBaseUrl."
        );
      }
      const res = await fetch(
        `${WOOP_API_BASE_URL}/api/app-codes/validate?code=${encodeURIComponent(
          appCode
        )}`
      );
      if (!res.ok) return false;
      const json = await res.json();
      return json.valid === true;
    } catch (e) {
      console.error("App code validation failed:", e);
      return false;
    }
  };

  const isValid = await validateAppCodeViaApi(config.appCode);
  if (!isValid) {
    throw new Error("Invalid appCode. Please register your appCode first.");
  }

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
  const baseUrl = `${WOOP_API_BASE_URL}/widgetext`;
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
      container.removeChild(iframe);
      window.removeEventListener("message", sendWalletInfo);
    },
  };
}
