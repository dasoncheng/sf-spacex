import { RoomDetail } from "../models/996box";
import { http } from "../utils/http";
import { toSign } from "../utils/sign";

export function getRoomDetail(params: { live_no: string }) {
  // Create form data
  const formData = new FormData();
  const sign = toSign(
    { live_no: params.live_no },
    { appv: "3.6.0", device: "ios", deviceId: "" }
  );
  formData.append("live_no", sign.live_no);
  formData.append("rqtime", sign.rqtime);
  formData.append("rqrandom", sign.rqrandom);
  formData.append("sign", sign.sign);

  return http.post<RoomDetail>(
    "http://live-api.996box.com/api/v3/Room/detail",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        device: "ios",
        appv: "3.6.0",
        "box-agent": "appv:3.6.0;device:ios;deviceId:;",
        996: true,
      },
    }
  );
}

// 查询直播间贡献日榜
export function queryLiveRoomDayRankList(liveNo: string) {
  return http.get<{
    list: Array<{
      uid: number;
      nickname: string;
      avatar: string;
      coin_count: number;
      rank: number;
    }>;
  }>(`https://api.996hezi.com/show/v1/queryLiveRoomRankList`, {
    params: {
      liveNo,
      rankType: "DAY",
      rqtime: "1742457821000",
      rqrandom: "LFD632683U78YL5R89OCYEYZGJ6KS8SS",
      sign: "7d25965071caa87f9000898b7af1cfb1",
    },
    headers: {
      996: true,
    },
  });
}

// 查询直播间贡献周榜
export function queryLiveRoomWeekRankList(liveNo: string) {
  return http.get<{
    list: Array<{
      uid: number;
      nickname: string;
      avatar: string;
      coin_count: number;
      rank: number;
    }>;
  }>(`https://api.996hezi.com/show/v1/queryLiveRoomRankList`, {
    params: {
      liveNo,
      rankType: "WEEK",
      rqtime: "1742459272000",
      rqrandom: "AT2XPJUFP2CT7MTB3AB1Q3EOQONL2G76",
      sign: "d7c8c0eda56de570d443bb24f750b493",
    },
    headers: {
      996: true,
    },
  });
}

// 查询直播间在线观众
export function queryLiveRoomOnlineUsers(liveNo: string) {
  return http.get<{
    list: Array<{
      uid: number;
      nickname: string;
      avatar: string;
      level_info: {
        level: number;
        level_icon: string;
      };
    }>;
  }>(`https://api.996hezi.com/show/v1/queryLiveRoomOnlineUsers`, {
    params: {
      liveNo,
      rqtime: "1742457821000",
      rqrandom: "3S2UT49IBV1ULG7S8NKNKME7M333GYHP",
      sign: "a4792ac3e37617df081baa46076b7974",
    },
    headers: {
      996: true,
    },
  });
}

// 查询直播间观众人数
export function queryLiveRoomUserNum(liveNo: string) {
  return http.get<{
    live_online_user_count: number;
    online_user_count: number;
  }>(`https://api.996hezi.com/show/v1/queryLiveRoomUserNum`, {
    params: {
      liveNo,
      rqtime: "1742457821000",
      rqrandom: "M81IAVMX3SJ93BVBFDUK64GTEYE244M1",
      sign: "89c499807e799951053cd6b7592f88c8",
    },
    headers: {
      996: true,
    },
  });
}
