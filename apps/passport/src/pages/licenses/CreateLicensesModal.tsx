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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

enum Validity {
  Always = "always",
  Interval = "interval",
}

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
    const Duration = ref();
    const count = ref();

    const isSubmitting = ref(false);
    const error = ref<string | null>(null);
    const validity = ref(Validity.Always);

    // Reset form
    const resetForm = () => {
      Duration.value = "";
      count.value = "";
      error.value = null;
    };
    const validateForm = () => {
      error.value = null;
      if (validity.value === Validity.Interval && !Duration.value) {
        error.value = "Duration is required";
        return false;
      }
      return true;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;
      try {
        await props.onSubmit({
          Duration: Duration.value,
        });
        resetForm();
      } catch (err: any) {
        error.value = err.message || "Failed to create License";
        console.error("Error in form submission:", err);
      } finally {
        isSubmitting.value = false;
      }
      // try {
      //   isSubmitting.value = true;
      //   props.isSingle
      //     ? await props.onSubmit({
      //         ExpiresAt: ExpiresAt.value,
      //       })
      //     : await props.onSublitBatch({
      //         ExpiresAt: ExpiresAt.value,
      //         count: count.value,
      //       });
      //   resetForm();
      // } catch (err: any) {
      //   error.value = err.message || "Failed to create License";
      //   console.error("Error in form submission:", err);
      // } finally {
      //   isSubmitting.value = false;
      // }
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
              {props.isSingle ? "新建卡密" : "批量新建卡密"}
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
                <RadioGroup
                  v-model={validity.value}
                  class="flex space-x-4"
                  onUpdate:modelValue={() => {
                    if (validity.value === Validity.Always) {
                      error.value = "";
                      Duration.value = undefined;
                    }
                  }}
                >
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="r1" value="always" />
                    <Label for="r1">永久有效</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="r2" value="interval" />
                    <Label for="r2">有效期</Label>
                  </div>
                </RadioGroup>
              </div>
              {validity.value === Validity.Interval && (
                <div class="grid gap-2">
                  <Input
                    id="Duration"
                    type="number"
                    v-model={Duration.value}
                    placeholder="请输入有效期（以天为单位）"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting.value}>
                {isSubmitting.value ? "新建中..." : "新建卡密"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
