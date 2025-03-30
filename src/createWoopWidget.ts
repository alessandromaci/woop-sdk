import type { WoopWidgetParams, EIP6963ProviderDetail } from "./types";

export async function createWoopWidget(
  container: HTMLElement,
  params: WoopWidgetParams
) {
  let address = "";
  const providers: EIP6963ProviderDetail[] = [];

  const handleProviderAnnounce = (event: Event) => {
    const e = event as CustomEvent<EIP6963ProviderDetail>;
    providers.push(e.detail);
  };

  window.addEventListener("eip6963:announceProvider", handleProviderAnnounce);

  // Request providers to announce themselves
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  // Wait briefly to collect providers
  await new Promise((res) => setTimeout(res, 300));

  window.removeEventListener(
    "eip6963:announceProvider",
    handleProviderAnnounce
  );

  // Choose provider: either passed in, or first EIP-6963 provider, or fallback to window.ethereum
  const effectiveProvider =
    params.provider || providers[0]?.provider || (window as any).ethereum;

  if (effectiveProvider) {
    try {
      const accounts = await effectiveProvider.request({
        method: "eth_requestAccounts",
      });
      address = (accounts as string[])[0] ?? "";

      address = accounts?.[0] ?? "";
    } catch (err) {
      console.error("Failed to get wallet address:", err);
    }
  }

  container.innerHTML = `
    <div style="padding: 20px; border: 1px solid #ccc;">
      <strong>Woop Widget</strong><br />
      
      <!-- Core Parameters -->
      App Code: ${params.appCode}<br />
      Assets: ${params.assets.join(", ")}<br />
      
      <!-- Module Configuration -->
      Modules: ${JSON.stringify(params.modules)}<br />
      
      <!-- Network Configuration -->
            Provider: ${
              params.provider
                ? "custom"
                : providers[0]?.info.name || "window.ethereum"
            }<br />
      Networks: ${JSON.stringify(params.networks)}<br />
      
      <!-- UI/Theme Configuration -->
      Theme: ${params.theme}<br />
      Button Color: ${params.buttonColor}<br />
      Logo: ${params.logo}<br />
      
      <!-- Wallet Status -->
      Wallet: ${address || "No wallet connected"}<br />
    </div>
  `;
}
