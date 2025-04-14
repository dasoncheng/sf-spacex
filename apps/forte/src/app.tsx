import { defineComponent } from "vue";
import { Editor } from "./pages/editor";
import { LoginDialog } from "./components/login-dialog";

export const App = defineComponent({
  setup() {
    return () => (
      <>
        <Editor />
        <LoginDialog />
      </>
    );
  },
});
