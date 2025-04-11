import { defineComponent } from "vue";
import { Editor } from "./pages/editor";

export const App = defineComponent({
  setup() {
    return () => <Editor />;
  },
});
