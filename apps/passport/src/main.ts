import "./index.css";
import { createApp } from "vue";
import { App } from "./app";
import { router } from "./routes";

// Initialize dark mode from user preference or localStorage
const initDarkMode = () => {
  const isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Initialize compact layout from localStorage
const initCompactLayout = () => {
  const isCompact = localStorage.getItem("layout") === "compact";

  if (isCompact) {
    document.documentElement.classList.add("compact");
    document.body.classList.add("layout-compact");
  } else {
    document.documentElement.classList.remove("compact");
    document.body.classList.add("layout-default");
  }
};

// Apply theme transitions after initial load
window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("theme-transition");
});

// Initialize theme and layout
initDarkMode();
initCompactLayout();

const app = createApp(App);

// Register global properties for theme toggling
app.config.globalProperties.$toggleDarkMode = () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
};

app.config.globalProperties.$toggleCompactLayout = () => {
  const isCompact = document.documentElement.classList.toggle("compact");

  if (isCompact) {
    document.body.classList.add("layout-compact");
    document.body.classList.remove("layout-default");
  } else {
    document.body.classList.remove("layout-compact");
    document.body.classList.add("layout-default");
  }

  localStorage.setItem("layout", isCompact ? "compact" : "default");
};

app.use(router);
app.mount("#app");
