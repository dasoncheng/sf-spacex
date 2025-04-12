import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, ExternalLink } from "lucide-vue-next";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getRoles, createRole } from "@/services/roles";
import type { Role } from "@/types/api";
import { CreateRoleModal } from "./CreateRoleModal";
import { format } from "date-fns";

export const RolesList = defineComponent({
  name: "RolesList",
  setup() {
    const router = useRouter();
    const roles = ref<Role[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const isCreateModalOpen = ref(false);

    // Format date to yyyy-MM-dd HH:mm:ss format using date-fns
    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    };

    // Navigate to role detail page
    const viewRoleDetails = (roleId: string) => {
      router.push(`/roles/${roleId}`);
    };

    // Load roles from API
    const loadRoles = async () => {
      try {
        loading.value = true;
        roles.value = await getRoles();
      } catch (err: any) {
        error.value = err.message || "Failed to load roles";
        console.error("Error loading roles:", err);
      } finally {
        loading.value = false;
      }
    };

    // Show modal for creating a new role
    const showCreateRoleModal = () => {
      isCreateModalOpen.value = true;
    };

    // Handle role creation
    const handleRoleCreated = async (roleData: {
      name: string;
      description?: string;
    }) => {
      try {
        // Call API to create role
        await createRole(roleData);
        await loadRoles();
        // Close modal
        isCreateModalOpen.value = false;
      } catch (err: any) {
        console.error("Error creating role:", err);
        error.value = err.message || "Failed to create role";
      }
    };

    // Load roles on component mount
    onMounted(() => {
      loadRoles();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">角色</h1>
          <Button class="flex gap-1 items-center" onClick={showCreateRoleModal}>
            <PlusCircle class="h-4 w-4" />
            添加角色
          </Button>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载角色中...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : (
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead class="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} class="text-center py-8">
                      未找到角色
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.value.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell class="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || "无描述"}</TableCell>
                      <TableCell>{formatDate(role.createdAt)}</TableCell>
                      <TableCell class="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewRoleDetails(role.id)}
                        >
                          <ExternalLink class="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create Role Modal */}
        <CreateRoleModal
          isOpen={isCreateModalOpen.value}
          onClose={() => (isCreateModalOpen.value = false)}
          onSubmit={handleRoleCreated}
        />
      </div>
    );
  },
});
