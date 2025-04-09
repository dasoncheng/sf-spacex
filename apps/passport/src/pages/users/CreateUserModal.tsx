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

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; password: string }) => void;
}

export const CreateUserModal = defineComponent({
  name: "CreateUserModal",
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
        email: string;
        password: string;
      }) => void,
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
        await props.onSubmit({
          email: email.value,
          password: password.value,
        });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "Failed to create user";
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
          handleClose()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新用户</DialogTitle>
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
                  placeholder="user@example.com"
                  v-model={email.value}
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  v-model={password.value}
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="confirm-password">确认密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  v-model={confirmPassword.value}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "创建中..." : "创建用户"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
