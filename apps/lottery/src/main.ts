import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./themes/base.scss";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { App } from "./app";
import { InitHardwareId } from "./utils/activate";
import { initEnvironment } from "./utils/environment";

async function application() {
  await initEnvironment();

  if (Reflect.has(window, "__TAURI_INTERNALS__")) {
    await InitHardwareId();
  }

  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);
  app.mount("#app");
}

application();
