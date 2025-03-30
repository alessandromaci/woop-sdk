export interface WoopWidgetParams {
  appCode: string;
  mode: "pay" | "request" | "tip" | "cashback";
  token: string;
  amount?: string;
  recipient?: string;
  provider?: any; // will later extend this to EIP-1193
}
