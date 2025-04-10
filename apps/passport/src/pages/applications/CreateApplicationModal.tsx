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

export const CreateApplicationModal = defineComponent({
  name: "CreateApplicationModal",
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
        Name: string;
        Description: string;
      }) => void,
      required: true,
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
        error.value = "Name is required";
        return false;
      }
      return true;
    };

    // Reset form
    const resetForm = () => {
      name.value = "";
      description.value = "";
      error.value = null;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await props.onSubmit({
          Name: name.value,
          Description: description.value,
        });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "Failed to create Application";
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
            <DialogTitle>新建应用</DialogTitle>
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
                <Label for="name">应用名称</Label>
                <Input id="name" type="text" v-model={name.value} required />
              </div>

              <div class="grid gap-2">
                <Label for="description">应用描述</Label>
                <Input
                  id="description"
                  type="text"
                  v-model={description.value}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "新建中..." : "新建应用"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
