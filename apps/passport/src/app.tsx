import { defineComponent } from "vue";

export const App = defineComponent({
  setup() {
    return () => (
      <div class="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div class="text-3xl text-red-500">Hello, Vite + Vue 3 + UnoCSS!</div>
      </div>
    );
  },
});
