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
      <Dialog open={props.isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
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
                <Label for="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email.value}
                  onInput={(e) =>
                    (email.value = (e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password.value}
                  onInput={(e) =>
                    (password.value = (e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div class="grid gap-2">
                <Label for="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword.value}
                  onInput={(e) =>
                    (confirmPassword.value = (
                      e.target as HTMLInputElement
                    ).value)
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
