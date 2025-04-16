import { defineComponent } from "vue";

export const App = defineComponent({
  setup() {
    return () => (
      <div style={{}}>
        <h1>Vite + Vue 3 + Viso</h1>
        <p>
          Vite is a next-generation, front-end tool that focuses on speed and
          performance.
        </p>
        <p>Vue 3 is a progressive framework for building user interfaces.</p>
        <p>Viso is a framework for building web applications with Vue 3.</p>
      </div>
    );
  },
});
