import { WidgetConfig } from "./types";
// @ts-ignore
import process from "process";

// Read valid app codes from environment variable (comma-separated)
const ENV_CODES = process.env.WOOP_VALID_APP_CODES
  ? (process.env.WOOP_VALID_APP_CODES as string)
      .split(",")
      .map((code: string) => code.trim())
  : [];
const VALID_APP_CODES = new Set(ENV_CODES);

export async function validateAppCode(config: WidgetConfig): Promise<boolean> {
  // Check if appCode is provided
  if (!config.appCode) {
    console.error("No appCode provided");
    return false;
  }

  // Check if appCode is valid
  if (!VALID_APP_CODES.has(config.appCode)) {
    console.error(`Invalid appCode: ${config.appCode}`);
    return false;
  }

  return true;
}

// Function to register a new appCode (for future DB use)
export async function registerAppCode(appCode: string): Promise<boolean> {
  VALID_APP_CODES.add(appCode);
  return true;
}
