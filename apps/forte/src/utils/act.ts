import { ActType, ResourceConfig } from "../models/act";

export const ACTS = new Map<ActType, ResourceConfig>();

export async function loadActConfig() {
  try {
    for (let i = 1; i <= 8; i++) {
      const response = await fetch(`/configs/act_0${i}.json`);
      if (!response.ok) {
        console.error(`Failed to load act_0${i}.json: ${response.statusText}`);
        continue;
      }
      const config: ResourceConfig = await response.json();
      const actType = config.Type as ActType;
      ACTS.set(actType, config);
    }
  } catch (error) {
    console.error("Error loading act configurations:", error);
  }
}
