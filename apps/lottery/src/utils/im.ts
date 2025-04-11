import WebIM, { EasemobChat } from "easemob-websdk";

WebIM.logger.setLevel("ERROR");

export const conn = new WebIM.connection({
  appKey: "1106210925091459#996box-live-prod",
});
conn.addEventHandler("connection", {
  onConnected: () => {
    // console.log("Connect success !");
  },
  onDisconnected: () => {
    // console.log("Logout success !");
  },
  onError: (error) => {
    // console.log("on error", error);
  },
});
conn.open({
  user: "visitorDC05449278254739",
  pwd: "59fd3802dab05e8f983042310f1e39f8",
});
