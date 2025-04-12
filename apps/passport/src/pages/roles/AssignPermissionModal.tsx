import { defineComponent, ref, onMounted } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rolesService } from "@/services/roles";
import type { Permission } from "@/types/api";
import { getPermissions } from "@/services/permissions";

export const AssignPermissionModal = defineComponent({
  name: "AssignPermissionModal",
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
      type: Function as () => (permissionId: string) => void,
      required: true,
    },
    roleId: {
      type: String,
      required: true,
    },
    existingPermissionIds: {
      type: Array as () => string[],
      default: () => [],
    },
  },
  setup(props) {
    const permissionId = ref<string>("");
    const availablePermissions = ref<Permission[]>([]);
    const isSubmitting = ref(false);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    // Load all permissions
    const loadPermissions = async () => {
      try {
        isLoading.value = true;
        const permissions = await getPermissions();
        // Filter out permissions that are already assigned
        availablePermissions.value = permissions.filter(
          (permission) => !props.existingPermissionIds.includes(permission.id)
        );
      } catch (err: any) {
        error.value = err.message || "加载权限失败";
        console.error("Error loading permissions:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // Load permissions when modal opens
    onMounted(() => {
      if (props.isOpen) {
        loadPermissions();
      }
    });

    // Reset form
    const resetForm = () => {
      permissionId.value = "";
      error.value = null;
    };

    // Validate form
    const validateForm = () => {
      error.value = null;
      if (!permissionId.value) {
        error.value = "请选择一个权限";
        return false;
      }
      return true;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        isSubmitting.value = true;
        await props.onSubmit(permissionId.value);
        resetForm();
      } catch (err: any) {
        error.value = err.message || "分配权限失败";
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

    // Group permissions by resource
    const groupedPermissions = () => {
      const grouped: Record<string, Permission[]> = {};
      availablePermissions.value.forEach((permission) => {
        if (!grouped[permission.resource]) {
          grouped[permission.resource] = [];
        }
        grouped[permission.resource].push(permission);
      });
      return grouped;
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
            <DialogTitle>分配权限</DialogTitle>
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

              {isLoading.value ? (
                <div class="text-center py-4">加载权限中...</div>
              ) : availablePermissions.value.length === 0 ? (
                <div class="text-center py-4">没有可用的权限</div>
              ) : (
                <div class="grid gap-2">
                  <Label for="permission">选择权限</Label>
                  <Select
                    modelValue={permissionId.value}
                    onUpdate:modelValue={(val: string) => {
                      permissionId.value = val;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择一个权限" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(groupedPermissions()).map(
                        ([resource, permissions]) => (
                          <div key={resource}>
                            <div class="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                              {resource}
                            </div>
                            {permissions.map((permission) => (
                              <SelectItem
                                key={permission.id}
                                value={permission.id}
                              >
                                {permission.name} -{" "}
                                {permission.description || permission.action}
                              </SelectItem>
                            ))}
                          </div>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting.value ||
                  isLoading.value ||
                  availablePermissions.value.length === 0
                }
              >
                {isSubmitting.value ? "保存中..." : "分配"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
});
