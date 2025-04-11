import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./themes/base.scss";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { App } from "./app";
import { InitHardwareId } from "./utils/activate";
async function application() {
  // await InitHardwareId();
  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);
  app.mount("#app");
}
application();
