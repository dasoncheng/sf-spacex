import { fetch } from "@tauri-apps/plugin-http";
import { RoomDetail } from "../models/996box";
import { environment } from "../utils/environment";
import { toSign } from "../utils/sign";

/**
 * Get room details using Tauri fetch API
 */
export async function getRoomDetail(params: {
  live_no: string;
}): Promise<{ data: RoomDetail }> {
  // Create form data as URLSearchParams
  const formData = new URLSearchParams();
  const sign = toSign(
    { live_no: params.live_no },
    {
      appv: environment[996].appv,
      device: environment[996].device,
      deviceId: "",
    }
  );

  // Add form parameters
  formData.append("live_no", sign.live_no);
  formData.append("rqtime", sign.rqtime);
  formData.append("rqrandom", sign.rqrandom);
  formData.append("sign", sign.sign);

  // Tauri fetch request with form data
  const response = await fetch(
    "http://live-api.996box.com/api/v3/Room/detail",
    {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Device: environment[996].device,
        Appv: environment[996].appv,
        "Box-Agent": `appv:${environment[996].appv};device:${environment[996].device};deviceId:;`,
      },
    }
  );

  return response.json();
}
