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
import type { CreateLicenseDto, BatchCreateLicenseDto } from "@/types/api";

export const CreateLicensesModal = defineComponent({
  name: "CreateLicensesModal",
  props: {
    isSingle: {
      type: Boolean,
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    onClose: {
      type: Function as () => () => void,
      required: true,
    },
    onSubmit: {
      type: Function as () => (data: CreateLicenseDto) => void,
      required: true,
    },
    onSublitBatch: {
      type: Function as () => (data: BatchCreateLicenseDto) => void,
      required: true,
    },
  },
  setup(props) {
    const ExpiresAt = ref();
    const count = ref();

    const isSubmitting = ref(false);
    const error = ref<string | null>(null);

    // Reset form
    const resetForm = () => {
      ExpiresAt.value = "";
      count.value = "";
      error.value = null;
    };
    const validateForm = () => {
      error.value = null;
      if (!count.value && !props.isSingle) {
        error.value = "Count is required";
        return false;
      }
      return true;
    };
    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;
      try {
        isSubmitting.value = true;
        props.isSingle
          ? await props.onSubmit({
              ExpiresAt: ExpiresAt.value,
            })
          : await props.onSublitBatch({
              ExpiresAt: ExpiresAt.value,
              count: count.value,
            });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "Failed to create License";
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
            <DialogTitle>
              {props.isSingle ? "新建许可证" : "批量新建许可证"}
            </DialogTitle>
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

              {!props.isSingle && (
                <div class="grid gap-2">
                  <Label for="count">数量</Label>
                  <Input
                    id="count"
                    type="number"
                    v-model={count.value}
                    required
                  />
                </div>
              )}

              <div class="grid gap-2">
                <Label for="ExpiresAt">有效期</Label>
                <Input id="ExpiresAt" type="number" v-model={ExpiresAt.value} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "新建中..." : "新建许可证"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
