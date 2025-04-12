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
import { Textarea } from "@/components/ui/textarea";
import type { CreateRoleDto, Role, UpdateRoleDto } from "@/types/api";

export const CreateRoleModal = defineComponent({
  name: "CreateRoleModal",
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
      type: Function as () => (data: CreateRoleDto) => void,
      required: true,
    },
    role: {
      type: Object as () => Role | null,
      default: null,
    },
  },
  setup(props) {
    const name = ref("");
    const description = ref("");

    const isSubmitting = ref(false);
    const error = ref<string | null>(null);

    // Validate form
    const validateForm = () => {
      error.value = null;
      if (!name.value) {
        error.value = "角色名称不能为空";
        return false;
      }
      return true;
    };

    // Reset form
    const resetForm = () => {
      name.value = props.role?.name || "";
      description.value = props.role?.description || "";
      error.value = null;
    };

    // Initialize form with role data if provided
    const initForm = () => {
      if (props.role) {
        name.value = props.role.name;
        description.value = props.role.description || "";
      } else {
        resetForm();
      }
    };

    // Watch for changes in the role prop
    (() => {
      initForm();
    })();

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await props.onSubmit({
          name: name.value,
          description: description.value,
        });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "创建角色失败";
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
            <DialogTitle>{props.role ? "编辑角色" : "创建角色"}</DialogTitle>
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
                <Label for="name">角色名称</Label>
                <Input id="name" type="text" v-model={name.value} required />
              </div>

              <div class="grid gap-2">
                <Label for="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="角色描述"
                  v-model={description.value}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value
                  ? "保存中..."
                  : props.role
                  ? "保存"
                  : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
