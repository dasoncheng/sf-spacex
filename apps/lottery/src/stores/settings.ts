import { defineStore } from "pinia";
import { reactive } from "vue";
import { md5 } from "../utils/forge";

// Storage key for localStorage
const STORAGE_KEY = md5("lottery_settings");

export interface LotterySettings {
  commandEnabled: boolean;
  minParticipants: number;
  drawMode: "fixed" | "ratio";
  winnersCount: number;
  drawRatio: number;
  chargingTime: number;
}

/**
 * 抽奖系统设置状态管理
 * 使用Pinia管理抽奖系统的配置和设置
 */
export const useSettingsStore = defineStore("settings", () => {
  const settings = reactive<LotterySettings>({
    commandEnabled: false,
    minParticipants: 3,
    drawMode: "fixed",
    winnersCount: 1,
    drawRatio: 10,
    chargingTime: 60,
  });

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings) as LotterySettings;
        Object.assign(settings, parsedSettings);
        // console.log("Settings loaded from localStorage");
      }
    } catch (error) {
      // console.error("Failed to load settings from localStorage:", error);
    }
  };

  // Helper methods for adjustment
  const incrementMinParticipants = () => {
    settings.minParticipants++;
  };

  const decrementMinParticipants = () => {
    if (settings.minParticipants > 1) {
      settings.minParticipants--;
    }
  };

  const incrementWinnerCount = () => {
    settings.winnersCount++;
  };

  const decrementWinnerCount = () => {
    if (settings.winnersCount > 1) {
      settings.winnersCount--;
    }
  };

  const incrementRatio = () => {
    settings.drawRatio++;
  };

  const decrementRatio = () => {
    if (settings.drawRatio > 1) {
      settings.drawRatio--;
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // console.log("Settings saved to localStorage");
    } catch (error) {
      // console.error("Failed to save settings to localStorage:", error);
    }
  };

  /**
   * 重置设置到默认值
   */
  const resetSettings = () => {
    settings.commandEnabled = false;
    settings.minParticipants = 3;
    settings.drawMode = "fixed";
    settings.winnersCount = 1;
    settings.drawRatio = 10;
    settings.chargingTime = 60;
  };

  // Load settings from localStorage when store is initialized
  loadSettings();

  return {
    settings,
    incrementMinParticipants,
    decrementMinParticipants,
    incrementWinnerCount,
    decrementWinnerCount,
    incrementRatio,
    decrementRatio,
    saveSettings,
    resetSettings,
  };
});
