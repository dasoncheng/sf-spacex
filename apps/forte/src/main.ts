import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./themes/base.scss";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { App } from "./app";
import { loadActConfig } from "./utils/act";
import { initEnvironment } from "./utils/environment";

async function application() {
  await initEnvironment();
  await loadActConfig();
  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);
  app.mount("#app");
}
application();
