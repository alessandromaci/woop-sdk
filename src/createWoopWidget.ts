import type { WoopWidgetParams } from "./types";

export function createWoopWidget(
  container: HTMLElement,
  params: WoopWidgetParams
) {
  container.innerHTML = `
    <div style="padding: 20px; border: 1px solid #ccc;">
      <strong>Woop Widget</strong><br />
      Mode: ${params.mode}<br />
      Amount: ${params.amount} ${params.token}<br />
      Recipient: ${params.recipient}<br />
      App: ${params.appCode}
    </div>
  `;
}
