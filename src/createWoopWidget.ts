import type { WoopWidgetParams } from "./types";

export async function createWoopWidget(
  container: HTMLElement,
  params: WoopWidgetParams
) {
  // Build base iframe URL
  const baseUrl = "https://app.woopwidget.com/widget";
  const query = new URLSearchParams({
    appCode: params.appCode,
    assets: params.assets.join(","),
    theme: params.theme || "light",
    modules: JSON.stringify(params.modules),
    networks: JSON.stringify(params.networks || {}),
    buttonColor: params.buttonColor || "",
    logo: params.logo || "",
  }).toString();

  const iframeUrl = `${baseUrl}?${query}`;

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.src = iframeUrl;
  iframe.width = "100%";
  iframe.height = "600";
  iframe.style.border = "none";
  iframe.id = "woop-widget-frame";

  // Clear and append
  container.innerHTML = "";
  container.appendChild(iframe);

  // Wait for iframe to load
  iframe.addEventListener("load", async () => {
    if (!params.provider) return;

    try {
      const accounts = await params.provider.request({
        method: "eth_requestAccounts",
      });
      const address = accounts?.[0];

      if (address) {
        iframe.contentWindow?.postMessage(
          {
            type: "WOOP_CONNECT",
            payload: {
              address,
              provider: params.provider,
            },
          },
          "https://app.woopwidget.com"
        );
      }
    } catch (err) {
      console.error("Failed to fetch wallet address:", err);
    }
  });
}
