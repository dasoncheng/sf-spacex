import { defineComponent } from "vue";
import { Lottery } from "./pages/Lottery";

export const App = defineComponent({
  setup() {
    return () => <Lottery />;
  },
});
