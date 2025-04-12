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
import { ArrowLeft, ExternalLink, PlusCircle, Trash2 } from "lucide-vue-next";
import { getUserById, getUserRoles, removeRole } from "@/services/users";
import { getRoles } from "@/services/roles";
import type { UserDetail as UserDetailType, Role } from "@/types/api";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UserDetail = defineComponent({
  name: "UserDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const user = ref<UserDetailType | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const availableRoles = ref<Role[]>([]);
    const loadingRoles = ref(false);

    // Modal states
    const isAssignRoleModalOpen = ref(false);
    const isRemoveRoleDialogOpen = ref(false);
    const selectedRoleId = ref<string>("");
    const roleToRemove = ref<string | null>(null);

    // Format date to local date string
    const formatDate = (dateString: string | undefined) => {
      return dateString ? new Date(dateString).toLocaleString() : "N/A";
    };

    // Navigate to application detail
    const viewApplicationDetails = (applicationId: string) => {
      router.push(`/applications/${applicationId}`);
    };

    // Navigate to role detail
    const viewRoleDetails = (roleId: string) => {
      router.push(`/roles/${roleId}`);
    };

    // Go back to users list
    const goBack = () => {
      router.push("/users");
    };

    // Load user details from API
    const loadUserDetails = async () => {
      const userId = route.params.id as string;
      if (!userId) {
        error.value = "User ID is required";
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        user.value = await getUserById(userId);
      } catch (err: any) {
        error.value = err.message || "Failed to load user details";
        console.error("Error loading user details:", err);
      } finally {
        loading.value = false;
      }
    };

    // Load available roles
    const loadAvailableRoles = async () => {
      if (!user.value) return;

      try {
        loadingRoles.value = true;
        const allRoles = await getRoles();

        // Filter out roles that the user already has
        const userRoleIds = new Set(
          user.value.roles?.map((role) => role.id) || []
        );
        availableRoles.value = allRoles.filter(
          (role) => !userRoleIds.has(role.id)
        );
      } catch (err: any) {
        console.error("Error loading roles:", err);
      } finally {
        loadingRoles.value = false;
      }
    };

    // Handle assign role
    const handleAssignRole = async () => {
      if (!user.value || !selectedRoleId.value) return;

      try {
        await getUserRoles(user.value.Id, selectedRoleId.value);
        await loadUserDetails();
        isAssignRoleModalOpen.value = false;
        selectedRoleId.value = "";
      } catch (err: any) {
        console.error("Error assigning role:", err);
      }
    };

    // Handle remove role
    const handleRemoveRole = async () => {
      if (!user.value || !roleToRemove.value) return;

      try {
        await removeRole(user.value.Id, roleToRemove.value);
        await loadUserDetails();
        isRemoveRoleDialogOpen.value = false;
        roleToRemove.value = null;
      } catch (err: any) {
        console.error("Error removing role:", err);
      }
    };

    // Open assign role modal
    const openAssignRoleModal = async () => {
      await loadAvailableRoles();
      isAssignRoleModalOpen.value = true;
    };

    // Confirm remove role
    const confirmRemoveRole = (roleId: string) => {
      roleToRemove.value = roleId;
      isRemoveRoleDialogOpen.value = true;
    };

    // Load user details on component mount
    onMounted(() => {
      loadUserDetails();
    });

    return () => (
      <div>
        <div class="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} class="mr-2">
            <ArrowLeft class="h-4 w-4 mr-1" />
            返回用户列表
          </Button>
          <h1 class="text-2xl font-bold">用户详情</h1>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载用户详情...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : user.value ? (
          <div class="space-y-6">
            {/* User Info Card */}
            <div class="rounded-lg border bg-card p-6">
              <h2 class="text-xl font-semibold mb-4">用户信息</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">邮箱</p>
                  <p class="font-medium">{user.value.Email}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">用户ID</p>
                  <p class="font-medium">{user.value.Id}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">创建时间</p>
                  <p class="font-medium">{formatDate(user.value.CreatedAt)}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">更新时间</p>
                  <p class="font-medium">{formatDate(user.value.UpdatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Roles Section */}
            <div class="rounded-lg border">
              <div class="flex items-center justify-between p-4 border-b">
                <h2 class="text-xl font-semibold">角色</h2>
                <Button
                  class="flex gap-1 items-center"
                  onClick={openAssignRoleModal}
                >
                  <PlusCircle class="h-4 w-4" />
                  分配角色
                </Button>
              </div>

              {user.value.roles && user.value.roles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.value.roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell class="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || "无描述"}</TableCell>
                        <TableCell>
                          <div class="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewRoleDetails(role.id)}
                            >
                              <ExternalLink class="h-4 w-4" />
                              <span class="sr-only">查看角色详情</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmRemoveRole(role.id)}
                            >
                              <Trash2 class="h-4 w-4" />
                              <span class="sr-only">移除角色</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div class="p-8 text-center text-muted-foreground">
                  该用户暂无角色
                </div>
              )}
            </div>

            {/* Applications Table */}
            <div class="rounded-lg border">
              <h2 class="text-xl font-semibold p-4">已使用的应用</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>应用 Key</TableHead>
                    <TableHead>激活时间</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead class="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.value.applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} class="text-center py-8">
                        用户未激活任何应用
                      </TableCell>
                    </TableRow>
                  ) : (
                    user.value.applications.map((app) => (
                      <TableRow key={app.Id}>
                        <TableCell class="font-medium">{app.Name}</TableCell>
                        <TableCell>
                          <code class="bg-muted rounded px-1 py-0.5 text-xs">
                            {app.AppKey}
                          </code>
                        </TableCell>
                        <TableCell>{formatDate(app.activatedAt)}</TableCell>
                        <TableCell>
                          {app.expiresAt
                            ? formatDate(app.expiresAt)
                            : "永不过期"}
                        </TableCell>
                        <TableCell class="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewApplicationDetails(app.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">查看应用详情</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div class="text-center py-8">未找到用户</div>
        )}

        {/* Assign Role Modal */}
        <Dialog
          open={isAssignRoleModalOpen.value}
          onOpenChange={(open) => (isAssignRoleModalOpen.value = open)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>分配角色</DialogTitle>
            </DialogHeader>

            <div class="py-4">
              {loadingRoles.value ? (
                <div class="text-center py-4">加载角色中...</div>
              ) : availableRoles.value.length === 0 ? (
                <div class="text-center py-4">没有可用的角色</div>
              ) : (
                <div class="space-y-4">
                  <div class="grid gap-2">
                    <Label for="role">选择角色</Label>
                    <Select
                      modelValue={selectedRoleId.value}
                      onUpdate:modelValue={(val: string) => {
                        selectedRoleId.value = val;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择一个角色" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.value.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}{" "}
                            {role.description ? `- ${role.description}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => (isAssignRoleModalOpen.value = false)}
              >
                取消
              </Button>
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRoleId.value || loadingRoles.value}
              >
                分配
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Role Confirmation Dialog */}
        <AlertDialog
          open={isRemoveRoleDialogOpen.value}
          onOpenChange={(open) => {
            isRemoveRoleDialogOpen.value = open;
            if (!open) roleToRemove.value = null;
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认移除角色</AlertDialogTitle>
              <AlertDialogDescription>
                确认要从此用户移除该角色吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => (isRemoveRoleDialogOpen.value = false)}
              >
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveRole}>
                移除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
});
