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
import { createUser } from "@/services/users";

export const RegisterModal = defineComponent({
  name: "RegisterModal",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    onClose: {
      type: Function as () => () => void,
      required: true,
    },
    onRegisterSuccess: {
      type: Function as () => () => void,
      required: true,
    },
    onShowLogin: {
      type: Function as () => () => void,
      required: true,
    },
  },
  setup(props) {
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const isSubmitting = ref(false);
    const error = ref<string | null>(null);

    // Validate form
    const validateForm = () => {
      error.value = null;
      if (!email.value) {
        error.value = "Email is required";
        return false;
      }
      if (!password.value) {
        error.value = "Password is required";
        return false;
      }
      if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return false;
      }
      return true;
    };

    // Reset form
    const resetForm = () => {
      email.value = "";
      password.value = "";
      confirmPassword.value = "";
      error.value = null;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await createUser({
          email: email.value,
          password: password.value,
        });
        resetForm();
        props.onRegisterSuccess();
      } catch (err: any) {
        error.value = err.message || "Registration failed";
        console.error("Error in registration:", err);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Handle modal close
    const handleClose = () => {
      resetForm();
      props.onClose();
    };

    // Switch to login modal
    const handleShowLogin = () => {
      resetForm();
      props.onShowLogin();
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
            <DialogTitle>注册新账号</DialogTitle>
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
                <Label for="email">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  v-model={email.value}
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

              <div class="grid gap-2">
                <Label for="confirm-password">确认密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="请再次输入密码"
                  v-model={confirmPassword.value}
                  required
                />
              </div>
            </div>

            <DialogFooter class="flex-col items-center sm:items-end">
              <Button
                type="submit"
                disabled={isSubmitting.value}
                class="w-full sm:w-auto"
              >
                {isSubmitting.value ? "注册中..." : "注册"}
              </Button>

              <div class="mt-4 text-center text-sm w-full">
                已有账号？
                <button
                  type="button"
                  class="text-primary hover:underline font-medium"
                  onClick={handleShowLogin}
                >
                  去登录
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
