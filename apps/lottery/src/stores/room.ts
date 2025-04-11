import { defineStore } from "pinia";
import { ref } from "vue";
import { RoomDetail } from "../models/996box";

export const useRoomStore = defineStore("room", () => {
  const detail = ref<RoomDetail | null>();
  const status = ref<"loading" | "success" | "error">("error");

  return {
    detail,
    status,
  };
});
