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
import { PlusCircle } from "lucide-vue-next";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RegisterModal } from "@/components/RegisterModal";
import { getUsers } from "@/services/users";
import type { User } from "@/types/api";
import { CreateUserModal } from "./CreateUserModal";
import { format } from "date-fns";

export const UsersList = defineComponent({
  name: "UsersList",
  setup() {
    const router = useRouter();
    const users = ref<User[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const isCreateModalOpen = ref(false);

    // Format date to yyyy-MM-dd HH:mm:ss format using date-fns
    const formatDate = (dateString: string) => {
      return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
    };

    // Navigate to user detail page
    const viewUserDetails = (userId: string) => {
      router.push(`/users/${userId}`);
    };

    // Load users from API
    const loadUsers = async () => {
      try {
        loading.value = true;
        users.value = await getUsers();
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
        // 注意：这里需要添加 createUser 函数到导入语句中
        // 由于现有代码中没有显示 usersService 中的 createUser 实现，这里先保留未修改
        // 在完整实现中应该是: await createUser(userData);
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} class="text-center py-8">
                      未找到用户
                    </TableCell>
                  </TableRow>
                ) : (
                  users.value.map((user) => (
                    <TableRow key={user.Id}>
                      <TableCell class="font-medium">{user.Email}</TableCell>
                      <TableCell>{formatDate(user.CreatedAt)}</TableCell>
                      <TableCell>{formatDate(user.UpdatedAt)}</TableCell>
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
