import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, Pencil, Trash2 } from "lucide-vue-next";
import { rolesService } from "@/services/rolesService";
import type { RoleDetail as RoleDetailType } from "@/types/api";
import { CreateRoleModal } from "./CreateRoleModal";
import { format } from "date-fns";
import { AssignPermissionModal } from "./AssignPermissionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const RoleDetail = defineComponent({
  name: "RoleDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const role = ref<RoleDetailType | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Modal states
    const isEditModalOpen = ref(false);
    const isAssignPermissionModalOpen = ref(false);
    const isDeleteDialogOpen = ref(false);
    const isPermissionRemoveDialogOpen = ref(false);
    const permissionToRemove = ref<string | null>(null);

    // Format date to yyyy-MM-dd HH:mm:ss format using date-fns
    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    };

    // Go back to roles list
    const goBack = () => {
      router.push("/roles");
    };

    // Load role details from API
    const loadRoleDetails = async () => {
      const roleId = route.params.id as string;
      if (!roleId) {
        error.value = "角色ID不能为空";
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        role.value = await rolesService.getRoleById(roleId);
      } catch (err: any) {
        error.value = err.message || "加载角色详情失败";
        console.error("Error loading role details:", err);
      } finally {
        loading.value = false;
      }
    };

    // Handle role update
    const handleRoleUpdate = async (roleData: {
      name: string;
      description?: string;
    }) => {
      if (!role.value) return;

      try {
        await rolesService.updateRole(role.value.id, roleData);
        await loadRoleDetails();
        isEditModalOpen.value = false;
      } catch (err: any) {
        console.error("Error updating role:", err);
        throw err;
      }
    };

    // Handle role deletion
    const handleRoleDelete = async () => {
      if (!role.value) return;

      try {
        await rolesService.deleteRole(role.value.id);
        router.push("/roles");
      } catch (err: any) {
        console.error("Error deleting role:", err);
        error.value = err.message || "删除角色失败";
      }
    };

    // Handle permission assignment
    const handleAssignPermission = async (permissionId: string) => {
      if (!role.value) return;

      try {
        await rolesService.assignPermission(role.value.id, { permissionId });
        await loadRoleDetails();
        isAssignPermissionModalOpen.value = false;
      } catch (err: any) {
        console.error("Error assigning permission:", err);
        throw err;
      }
    };

    // Handle permission removal
    const handleRemovePermission = async () => {
      if (!role.value || !permissionToRemove.value) return;

      try {
        await rolesService.removePermission(
          role.value.id,
          permissionToRemove.value
        );
        permissionToRemove.value = null;
        isPermissionRemoveDialogOpen.value = false;
        await loadRoleDetails();
      } catch (err: any) {
        console.error("Error removing permission:", err);
        error.value = err.message || "移除权限失败";
      }
    };

    // Show confirm dialog before removing permission
    const confirmRemovePermission = (permissionId: string) => {
      permissionToRemove.value = permissionId;
      isPermissionRemoveDialogOpen.value = true;
    };

    // Get existing permission IDs for filtering in the assign modal
    const getExistingPermissionIds = () => {
      if (!role.value) return [];
      return role.value.permissions.map((p) => p.id);
    };

    // Group permissions by resource for better display
    const groupedPermissions = () => {
      if (!role.value) return {};

      const grouped: Record<string, typeof role.value.permissions> = {};
      role.value.permissions.forEach((permission) => {
        if (!grouped[permission.resource]) {
          grouped[permission.resource] = [];
        }
        grouped[permission.resource].push(permission);
      });
      return grouped;
    };

    // Load role details on component mount
    onMounted(() => {
      loadRoleDetails();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <Button variant="ghost" onClick={goBack} class="mr-2">
              <ArrowLeft class="h-4 w-4 mr-1" />
              返回角色列表
            </Button>
            <h1 class="text-2xl font-bold">角色详情</h1>
          </div>

          {role.value && (
            <div class="flex gap-2">
              <Button
                variant="outline"
                onClick={() => (isEditModalOpen.value = true)}
              >
                <Pencil class="h-4 w-4 mr-1" />
                编辑
              </Button>
              <Button
                variant="destructive"
                onClick={() => (isDeleteDialogOpen.value = true)}
              >
                <Trash2 class="h-4 w-4 mr-1" />
                删除
              </Button>
            </div>
          )}
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载角色详情中...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : role.value ? (
          <div class="space-y-6">
            {/* Role Info Card */}
            <div class="rounded-lg border bg-card p-6">
              <h2 class="text-xl font-semibold mb-4">角色信息</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">名称</p>
                  <p class="font-medium">{role.value.name}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">角色ID</p>
                  <p class="font-medium">{role.value.id}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">描述</p>
                  <p class="font-medium">
                    {role.value.description || "无描述"}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">创建时间</p>
                  <p class="font-medium">{formatDate(role.value.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            <div class="rounded-lg border">
              <div class="flex items-center justify-between p-4 border-b">
                <h2 class="text-xl font-semibold">权限管理</h2>
                <Button
                  class="flex gap-1 items-center"
                  onClick={() => (isAssignPermissionModalOpen.value = true)}
                >
                  <PlusCircle class="h-4 w-4" />
                  添加权限
                </Button>
              </div>

              {Object.entries(groupedPermissions()).length > 0 ? (
                <div class="divide-y">
                  {Object.entries(groupedPermissions()).map(
                    ([resource, permissions]) => (
                      <div key={resource} class="p-4">
                        <h3 class="text-lg font-medium mb-2">{resource}</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>权限名称</TableHead>
                              <TableHead>描述</TableHead>
                              <TableHead>操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permissions.map((permission) => (
                              <TableRow key={permission.id}>
                                <TableCell class="font-medium">
                                  {permission.name}
                                </TableCell>
                                <TableCell>
                                  {permission.description || permission.action}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      confirmRemovePermission(permission.id)
                                    }
                                  >
                                    <Trash2 class="h-4 w-4" />
                                    <span class="sr-only">移除权限</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div class="p-8 text-center text-muted-foreground">
                  该角色暂无任何权限
                </div>
              )}
            </div>
          </div>
        ) : (
          <div class="text-center py-8">未找到角色信息</div>
        )}

        {/* Edit Role Modal */}
        {role.value && (
          <CreateRoleModal
            isOpen={isEditModalOpen.value}
            onClose={() => (isEditModalOpen.value = false)}
            onSubmit={handleRoleUpdate}
            role={role.value}
          />
        )}

        {/* Assign Permission Modal */}
        {role.value && (
          <AssignPermissionModal
            isOpen={isAssignPermissionModalOpen.value}
            onClose={() => (isAssignPermissionModalOpen.value = false)}
            onSubmit={handleAssignPermission}
            roleId={role.value.id}
            existingPermissionIds={getExistingPermissionIds()}
          />
        )}

        {/* Delete Role Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen.value}
          onOpenChange={(open) => (isDeleteDialogOpen.value = open)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除角色</AlertDialogTitle>
              <AlertDialogDescription>
                此操作将永久删除角色 "{role.value?.name}
                "。删除后不可恢复，确认要继续吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => (isDeleteDialogOpen.value = false)}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRoleDelete}>
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Remove Permission Confirmation Dialog */}
        <AlertDialog
          open={isPermissionRemoveDialogOpen.value}
          onOpenChange={(open) => {
            isPermissionRemoveDialogOpen.value = open;
            if (!open) permissionToRemove.value = null;
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认移除权限</AlertDialogTitle>
              <AlertDialogDescription>
                确认要从此角色中移除该权限吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => (isPermissionRemoveDialogOpen.value = false)}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRemovePermission}>
                移除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
});
