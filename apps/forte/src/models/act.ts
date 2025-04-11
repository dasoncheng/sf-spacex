export enum ActName {
  None = -1, // 未知
  Idle = 0, // 待机
  Walk = 1, // 行走
  Run = 2, // 奔跑
  AttackReady = 3, // 预备攻击
  AttackPhysic = 4, // 物理攻击
  Mine = 5, // 采矿
  AttackMagic = 6, // 魔法攻击
  Gather = 7, // 采集
  Hurt = 8, // 被攻击
  Die = 9, // 死亡
}
export enum ActDir {
  None = -1, // 未知
  Up = 0, // 上
  UpRight = 1, // 右上
  Right = 2, // 右
  DownRight = 3, // 右下
  Down = 4, // 下
  DownLeft = 5, // 左下
  Left = 6, // 左
  UpLeft = 7, // 左上
}

// 资源类型
export enum ActType {
  None = -1, // 未知
  Player = 0, // 玩家
  Monster = 1, // 怪物
  Effect = 2, // 特效
  Weapon = 3, // 武器
  Hair = 4, // 发型
  Wing = 5, // 翅膀
  Shield = 6, // 盾牌
  NPC = 7, // NPC
}

// 动作输出名称
export enum ActOutput {
  None = "未知",
  Idle = "待机",
  Walk = "行走",
  Run = "跑步",
  AttackReady = "预备攻击",
  AttackPhysic = "物理攻击",
  Mine = "采矿",
  AttackMagic = "魔法攻击",
  Gather = "采集",
  Hurt = "被攻击",
  Die = "死亡",
  Effect = "特效",
  Showcase = "展示",
}

// 资源动作
export interface ActAction {
  Start: number; // 动作开始帧
  Frame: number; // 动作帧数
  Skip: number; // 动作跳过帧数
  Output: string; // 动作名称
  Dir: number; // 动作方向
}

export interface ResourceConfig {
  Type: ActType; // 资源类型
  Actions: ActAction[]; // 动作列表
}
