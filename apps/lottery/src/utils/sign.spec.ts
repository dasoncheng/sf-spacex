import { describe, it, expect } from "vitest";
import { toSign } from "./sign";

describe("toSign function", () => {
  it("should generate correct parameters without device info", () => {
    const result = toSign(
      { live_no: "91618645" },
      {
        appv: "3.6.0",
        device: "pc",
        deviceId: "",
      }
    );
    const target = {
      live_no: "91618645",
      rqrandom: "44LV8Z7T9W97UZUQ6KECQ8HIZHDE1CFU",
      rqtime: 1742560338000,
      sign: "cf241024dfd28fe002840200f72e0d10",
    };

    // Check if required fields are added
    expect(result).toEqual(target);
  });
});
