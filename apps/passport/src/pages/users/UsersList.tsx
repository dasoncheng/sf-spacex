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
import { PlusCircle, Edit, Trash2, ExternalLink } from "lucide-vue-next";
import { usersService } from "@/services/usersService";
import type { User } from "@/types/api";
import { CreateUserModal } from "./CreateUserModal";

export const UsersList = defineComponent({
  name: "UsersList",
  setup() {
    const router = useRouter();
    const users = ref<User[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const isCreateModalOpen = ref(false);

    // Format date to local date string
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    // Navigate to user detail page
    const viewUserDetails = (userId: string) => {
      router.push(`/users/${userId}`);
    };

    // Load users from API
    const loadUsers = async () => {
      try {
        loading.value = true;
        users.value = await usersService.getUsers();
      } catch (err: any) {
        error.value = err.message || "Failed to load users";
        console.error("Error loading users:", err);
      } finally {
        loading.value = false;
      }
    };

    // Show modal for creating a new user
    const showCreateUserModal = () => {
      isCreateModalOpen.value = true;
    };

    // Handle user creation
    const handleUserCreated = async (userData: {
      email: string;
      password: string;
    }) => {
      try {
        // Call API to create user
        await usersService.createUser(userData);
        // Reload users list to show the newly created user
        await loadUsers();
        // Close modal
        isCreateModalOpen.value = false;
      } catch (err: any) {
        console.error("Error creating user:", err);
        error.value = err.message || "Failed to create user";
      }
    };

    // Load users on component mount
    onMounted(() => {
      loadUsers();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">用户管理</h1>
          <Button class="flex gap-1 items-center" onClick={showCreateUserModal}>
            <PlusCircle class="h-4 w-4" />
            添加用户
          </Button>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载用户中...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : (
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>邮箱</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead class="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} class="text-center py-8">
                      未找到用户
                    </TableCell>
                  </TableRow>
                ) : (
                  users.value.map((user) => (
                    <TableRow key={user.Id}>
                      <TableCell class="font-medium">{user.Email}</TableCell>
                      <TableCell>{formatDate(user.CreatedAt)}</TableCell>
                      <TableCell>{formatDate(user.UpdatedAt)}</TableCell>
                      <TableCell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewUserDetails(user.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">查看详情</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit class="h-4 w-4" />
                            <span class="sr-only">编辑</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 class="h-4 w-4" />
                            <span class="sr-only">删除</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen.value}
          onClose={() => (isCreateModalOpen.value = false)}
          onSubmit={handleUserCreated}
        />
      </div>
    );
  },
});
