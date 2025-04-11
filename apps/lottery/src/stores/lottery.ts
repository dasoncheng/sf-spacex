import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { conn } from "../utils/im";
import { useSettingsStore } from "./settings";
import { format } from "date-fns";

// 新增：观众状态枚举
export enum AudienceStatus {
  Pending = "pending", // 待分配
  Regular = "regular", // 福利区
  VIP = "vip", // 尊享区
}

export interface Audience {
  id: string;
  nickname: string;
  status: AudienceStatus; // 观众状态
  weight: number; // 权重值
}

export interface AudienceWinner extends Audience {
  time: string;
}

export enum MessageType {
  Text = "text",
  Gift = "gift",
  Join = "join",
  Leave = "leave",
  Share = "share",
  Follow = "follow",
}

// 新增：抽奖状态枚举
export enum LotteryStatus {
  NotConfigured = "not_configured", // 未配置就绪
  ReadyToCharge = "ready_to_charge", // 待开始充电
  Charging = "charging", // 充电中
  ReadyToDraw = "ready_to_draw", // 待开奖
  Drawn = "drawn", // 已开奖
}

interface MessageBase {
  type: MessageType;
  id: string;
  nickname: string;
  time: number;
}
export interface MessageText extends MessageBase {
  type: MessageType.Text;
  content: string;
}
export interface MessageGift extends MessageBase {
  type: MessageType.Gift;
  gift_name: string;
  count: number;
  icon: string;
  price: number;
}
export interface MessageJoin extends MessageBase {
  type: MessageType.Join;
}
export interface MessageLeave extends MessageBase {
  type: MessageType.Leave;
}
export interface MessageShare extends MessageBase {
  type: MessageType.Share;
}
export interface MessageFollow extends MessageBase {
  type: MessageType.Follow;
}
export type Interaction =
  | MessageText
  | MessageGift
  | MessageJoin
  | MessageLeave
  | MessageShare
  | MessageFollow;

/**
 * 抽奖系统状态管理
 * 使用Pinia管理直播间抽奖系统的状态和逻辑
 */
export const useLotteryStore = defineStore("lottery", () => {
  const settingsStore = useSettingsStore();
  const state = reactive({
    live_no: "", // 直播间号
    room_id: "", // 环信聊天室ID
    word: "", // 口令
    is_initialization: false, // 是否初始化完成
    is_loading: false, // 是否加载中
    is_charging: false, // 是否正在抽奖
    is_drawing: false, // 是否正在进行抽奖动画
    has_drawn: false, // 本轮是否已经抽过奖
    interactions: [] as Interaction[], // 互动消息列表
    // 统一的观众池，所有交互用户都添加到这里
    audiences: new Map<string, Audience>(),
    winner: [] as AudienceWinner[], // 中奖名单
    start_time: Number.MAX_SAFE_INTEGER, // 直播开始时间
  });

  // 获取特定状态的观众
  const vip_audiences = computed(() => {
    return Array.from(state.audiences.values()).filter(
      (audience) => audience.status === AudienceStatus.VIP
    );
  });

  const regular_audiences = computed(() => {
    return Array.from(state.audiences.values()).filter(
      (audience) => audience.status === AudienceStatus.Regular
    );
  });

  // 新增：计算当前抽奖状态
  const status = computed((): LotteryStatus => {
    if (!state.is_initialization) {
      return LotteryStatus.NotConfigured;
    }

    if (state.is_charging) {
      return LotteryStatus.Charging;
    }

    if (state.has_drawn) {
      return LotteryStatus.Drawn;
    }

    if (regular_audiences.value.length > 0 || vip_audiences.value.length > 0) {
      return LotteryStatus.ReadyToDraw;
    }

    return LotteryStatus.ReadyToCharge;
  });

  const canNotDrawing = computed(() => {
    return (
      state.is_drawing ||
      status.value !== LotteryStatus.ReadyToDraw ||
      (vip_audiences.value.length < settingsStore.settings.minParticipants &&
        regular_audiences.value.length < settingsStore.settings.minParticipants)
    );
  });

  /**
   * 添加或更新用户到观众池
   */
  const addOrUpdateAudience = (
    id: string,
    nickname: string,
    status?: AudienceStatus
  ) => {
    const Aid = `${id}`;
    const existingAudience = state.audiences.get(Aid);

    if (existingAudience) {
      // 更新用户信息和状态
      if (
        status &&
        (status === AudienceStatus.VIP ||
          existingAudience.status !== AudienceStatus.VIP)
      ) {
        existingAudience.status = status;
      }
      // 权重通过其他方法增加
    } else {
      // 新用户，初始权重为1.0
      const initialStatus: AudienceStatus =
        status ??
        (!settingsStore.settings.commandEnabled
          ? AudienceStatus.Regular
          : AudienceStatus.Pending);

      state.audiences.set(Aid, {
        id: Aid,
        nickname,
        status: initialStatus,
        weight: 1.0,
      });
    }
  };

  /**
   * 增加用户权重
   */
  const increaseAudienceWeight = (id: string, weightIncrement: number) => {
    const Aid = `${id}`;
    const audience = state.audiences.get(Aid);
    if (audience) {
      audience.weight += weightIncrement;
    }
  };

  conn.addEventHandler("room-message", {
    onCustomMessage: (t) => {
      if (t.to !== state.room_id || (t.time ?? 0) < state.start_time) {
        // console.log("onCustomMessage:Miss");
        return;
      }

      switch (t.customEvent) {
        case "enter_room2":
          state.interactions.push({
            id: t.customExts.uid,
            nickname: t.customExts.nickname,
            time: (t.time / 1e3) | 0,
            type: MessageType.Join,
          });

          // 添加到观众池
          addOrUpdateAudience(t.customExts.uid, t.customExts.nickname);
          break;

        case "do_share":
          state.interactions.push({
            id: t.customExts.uid,
            nickname: t.customExts.nickname,
            time: (t.time / 1e3) | 0,
            type: MessageType.Share,
          });

          // 添加到观众池，增加0.3权重（分享权重更高）
          addOrUpdateAudience(t.customExts.uid, t.customExts.nickname);
          increaseAudienceWeight(t.customExts.uid, 0.2);
          break;

        case "do_follow":
          state.interactions.push({
            id: t.customExts.uid,
            nickname: t.customExts.nickname,
            time: (t.time / 1e3) | 0,
            type: MessageType.Follow,
          });

          // 添加到观众池，增加0.2权重
          addOrUpdateAudience(t.customExts.uid, t.customExts.nickname);
          increaseAudienceWeight(t.customExts.uid, 0.2);
          break;

        case "give_gift2":
          state.interactions.push({
            id: t.customExts.uid,
            nickname: t.customExts.nickname,
            time: (t.time / 1e3) | 0,
            type: MessageType.Gift,
            gift_name: t.customExts.gift_name,
            count: t.customExts.count,
            icon: t.customExts.gift_icon,
            price: Number(t.customExts.price),
          });

          // 送礼物的用户添加到尊享区，权重增加基于礼物数量和价格
          const giftWeight =
            (Number(t.customExts.count) * Number(t.customExts.price)) / 10;
          addOrUpdateAudience(
            t.customExts.uid,
            t.customExts.nickname,
            AudienceStatus.VIP
          );
          increaseAudienceWeight(t.customExts.uid, giftWeight);
          break;

        default:
        // console.log("onCustomMessage:Default");
      }
    },

    onTextMessage: (t) => {
      // Only process messages intended for this room
      if (t.to !== state.room_id || (t.time ?? 0) < state.start_time) {
        // console.log("onTextMessage:Miss");
        return;
      }

      // 记录所有文本消息
      state.interactions.push({
        id: t.ext?.uid,
        nickname: t.ext?.nickname,
        time: (t.time / 1e3) | 0,
        type: MessageType.Text,
        content: t.msg,
      });

      // 添加用户到观众池
      addOrUpdateAudience(t.ext?.uid, t.ext?.nickname);

      // 根据口令设置决定是否更新状态为福利区
      if (
        !settingsStore.settings.commandEnabled || // 口令未启用
        t.msg === state.word // 口令启用且消息等于正确口令
      ) {
        addOrUpdateAudience(
          t.ext?.uid,
          t.ext?.nickname,
          AudienceStatus.Regular
        );
        // 增加基础互动权重
        increaseAudienceWeight(t.ext?.uid, 0.1);
      }
    },
  });

  const initialization = async (room_id: string) => {
    if (state.is_loading || state.is_charging) {
      return;
    }
    state.is_initialization = false;
    state.is_loading = true;
    // 91618645 - 220024116674562
    // 122034217 - 220024116674562
    state.room_id = room_id;
    state.is_initialization = true;
    state.is_loading = false;
  };

  const startCharging = async () => {
    if (!state.is_initialization || state.is_charging) {
      return;
    }
    state.is_charging = true;
    state.start_time = Date.now();

    // Before clearing the audience pool, check if there were audience groups
    // that didn't meet the minimum requirements in the previous round
    const minRequired = settingsStore.settings.minParticipants;
    const vipAudiencesToKeep =
      vip_audiences.value.length > 0 && vip_audiences.value.length < minRequired
        ? [...vip_audiences.value]
        : [];

    const regularAudiencesToKeep =
      regular_audiences.value.length > 0 &&
      regular_audiences.value.length < minRequired
        ? [...regular_audiences.value]
        : [];

    state.interactions = [];
    state.audiences.clear(); // 清空统一观众池
    state.has_drawn = false; // 重置抽奖状态

    // Restore audiences that didn't meet the minimum requirements in previous round
    vipAudiencesToKeep.forEach((audience) => {
      state.audiences.set(audience.id, { ...audience });
    });

    regularAudiencesToKeep.forEach((audience) => {
      state.audiences.set(audience.id, { ...audience });
    });

    state.word = Math.random().toString().substr(2, 3);
    await conn.joinChatRoom({ roomId: state.room_id });
  };

  const stopCharging = async () => {
    if (!state.is_charging) {
      return;
    }
    state.is_charging = false;
    state.start_time = Number.MAX_SAFE_INTEGER; // 重置直播开始时间
    await conn.leaveChatRoom({ roomId: state.room_id });
  };

  const toggleCharging = async () => {
    if (state.is_charging) {
      await stopCharging();
    } else {
      await startCharging();
    }
  };

  /**
   * 抽取幸运用户
   * 同时从尊享区和福利区根据设置的规则抽取幸运用户
   */
  const drawWinners = () => {
    // 检查是否正在充电或者已经抽过奖，如果是，则不允许抽奖
    if (state.is_charging) {
      console.warn("正在充电中，请先停止充电再进行抽奖");
      return;
    }

    if (state.has_drawn) {
      console.warn("本轮已经抽过奖，请重新开始充电后再抽奖");
      return;
    }

    // 检查是否有用户可以抽奖
    if (
      vip_audiences.value.length === 0 &&
      regular_audiences.value.length === 0
    ) {
      console.warn("没有用户可以抽奖");
      return;
    }

    // 设置抽奖状态
    state.is_drawing = true;

    // // 清空之前的中奖结果
    // state.vip_winner.clear();
    // state.regular_winner.clear();

    // 模拟抽奖动画过程
    setTimeout(() => {
      // 从尊享区抽取幸运用户
      drawVipWinner();

      // 从福利区抽取幸运用户
      drawRegularWinner();

      // 抽奖完成，更新状态
      state.is_drawing = false;
      state.has_drawn = true;
    }, 3000); // 1秒后显示结果，可以根据需要调整
  };

  /**
   * 从尊享区抽取幸运用户
   * 根据设置的抽奖模式、人数和权重选择用户加入到中奖名单
   */
  const drawVipWinner = () => {
    // 获取尊享区用户
    const vipUsers = vip_audiences.value;

    // 检查是否满足最小参与人数要求
    if (vipUsers.length < settingsStore.settings.minParticipants) {
      // console.log(
      //   `尊享区人数不足${settingsStore.settings.minParticipants}人，跳过抽奖`
      // );
      return;
    }

    // 确定要抽取的人数
    let winnersCount = 0;
    if (settingsStore.settings.drawMode === "fixed") {
      // 固定人数模式
      winnersCount = Math.min(
        settingsStore.settings.winnersCount,
        vipUsers.length
      );
    } else {
      // 比例模式
      winnersCount = Math.floor(
        vipUsers.length / settingsStore.settings.drawRatio
      );
      // 确保至少抽取1人
      winnersCount = Math.max(1, Math.min(winnersCount, vipUsers.length));
    }

    // 根据权重进行加权随机抽奖
    const winners = weightedRandomSelection(vipUsers, winnersCount);

    // 将中奖用户添加到尊享区中奖名单
    winners.forEach((winner) => {
      state.winner.push({
        ...winner,
        time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
    });
  };

  /**
   * 从福利区抽取幸运用户
   * 根据设置的抽奖模式、人数和权重选择用户加入到中奖名单
   */
  const drawRegularWinner = () => {
    // 获取福利区用户
    const regularUsers = regular_audiences.value;

    // 检查是否满足最小参与人数要求
    if (regularUsers.length < settingsStore.settings.minParticipants) {
      // console.log(
      //   `福利区人数不足${settingsStore.settings.minParticipants}人，跳过抽奖`
      // );
      return;
    }

    // 确定要抽取的人数
    let winnersCount = 0;
    if (settingsStore.settings.drawMode === "fixed") {
      // 固定人数模式
      winnersCount = Math.min(
        settingsStore.settings.winnersCount,
        regularUsers.length
      );
    } else {
      // 比例模式
      winnersCount = Math.floor(
        regularUsers.length / settingsStore.settings.drawRatio
      );
      // 确保至少抽取1人
      winnersCount = Math.max(1, Math.min(winnersCount, regularUsers.length));
    }

    // 根据权重进行加权随机抽奖
    const winners = weightedRandomSelection(regularUsers, winnersCount);

    // 将中奖用户添加到福利区中奖名单
    winners.forEach((winner) => {
      state.winner.push({
        ...winner,
        time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });
    });
  };

  /**
   * 基于权重的随机选择算法
   * @param users 用户列表
   * @param count 选择数量
   * @returns 选中的用户
   */
  const weightedRandomSelection = (
    users: Audience[],
    count: number
  ): Audience[] => {
    if (users.length === 0 || count === 0) return [];

    // 计算总权重
    const totalWeight = users.reduce((sum, user) => sum + user.weight, 0);

    // 如果总权重为0，则均等概率选择
    if (totalWeight === 0) {
      return randomSelection(users, count);
    }

    const selected = new Set<string>();
    const winners: Audience[] = [];

    // 进行加权随机选择
    while (winners.length < count && winners.length < users.length) {
      // 生成一个随机权重值
      const randomWeight = Math.random() * totalWeight;

      // 遍历用户寻找命中的权重区间
      let weightSum = 0;
      for (const user of users) {
        if (selected.has(user.id)) continue;

        weightSum += user.weight;
        if (randomWeight <= weightSum) {
          selected.add(user.id);
          winners.push(user);
          break;
        }
      }

      // 如果没有选中任何用户（理论上不应该发生），备选方案
      if (winners.length === 0) {
        return randomSelection(users, count);
      }
    }

    return winners;
  };

  /**
   * 普通随机选择（不考虑权重）
   */
  const randomSelection = (users: Audience[], count: number): Audience[] => {
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  return {
    state,
    vip_audiences,
    regular_audiences,
    status,
    canNotDrawing,
    initialization,
    startCharging,
    stopCharging,
    toggleCharging,
    drawWinners,
  };
});
