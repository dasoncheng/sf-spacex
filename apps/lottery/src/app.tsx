import { defineComponent } from "vue";
import { Lottery } from "./pages/lottery";
import { LoginDialog } from "./components/login-dialog";

export const App = defineComponent({
  setup() {
    return () => (
      <>
        <Lottery />
        <LoginDialog />
      </>
    );
  },
});
