import { defineComponent, ref } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginModal = defineComponent({
  name: "LoginModal",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    onClose: {
      type: Function as () => () => void,
      required: true,
    },
    onSubmit: {
      type: Function as () => (data: {
        mobileNum: string;
        password: string;
      }) => void,
      required: true,
    },
  },
  setup(props) {
    const mobileNum = ref("");
    const password = ref("");
    const isSubmitting = ref(false);
    const error = ref<string | null>(null);

    // Validate form
    const validateForm = () => {
      error.value = null;
      if (!mobileNum.value) {
        error.value = "MobileNum is required";
        return false;
      }
      if (!password.value) {
        error.value = "Password is required";
        return false;
      }
      return true;
    };

    // Reset form
    const resetForm = () => {
      mobileNum.value = "";
      password.value = "";
      error.value = null;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await props.onSubmit({
          mobileNum: mobileNum.value,
          password: password.value,
        });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "Failed to login";
        console.error("Error in form submission:", err);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Handle modal close
    const handleClose = () => {
      resetForm();
      props.onClose();
    };

    return () => (
      <Dialog
        open={props.isOpen}
        onUpdate:open={(va) => {
          handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div class="space-y-4 py-4">
              {error.value && (
                <div class="text-sm text-red-500 font-medium">
                  {error.value}
                </div>
              )}

              <div class="grid gap-2">
                <Label for="mobileNum">账号</Label>
                <Input
                  id="mobileNum"
                  type="text"
                  placeholder="请输入账号"
                  v-model={mobileNum.value}
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  v-model={password.value}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "登录中..." : "登录"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
