import { invoke } from "@tauri-apps/api/core";

// Interface for device identification
interface DeviceIdentification {
  hardware_id: string;
}
// 26d3b9fbb0233478a6d075d06e90cd83c2ffa9790b40ba3e1467d2eb02109996
// Cache for device identification
export const DeviceIdentificationCache: DeviceIdentification = {
  hardware_id: "",
};

/**
 * Gets hardware-based device identifier combining MAC addresses and disk serials
 * @returns Promise that resolves to a hardware ID string
 */
export async function InitHardwareId() {
  DeviceIdentificationCache.hardware_id = await invoke<string>(
    "get_device_identifiers"
  );
}
