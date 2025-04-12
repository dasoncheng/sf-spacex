import { defineComponent, ref, computed, watch, type PropType } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUnassignedUsers } from "@/services/users";
import type { UserInfo } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-vue-next";

export const AssignUserModal = defineComponent({
  name: "AssignUserModal",
  props: {
    isOpen: Boolean,
    roleId: String,
    onClose: Function as PropType<() => void>,
    onSubmit: Function as PropType<(userId: string) => void>,
  },
  setup(props) {
    const users = ref<UserInfo[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref("");
    const selectedUserId = ref<string | null>(null);

    // Watch for dialog open state
    watch(
      () => props.isOpen,
      (isOpen) => {
        if (isOpen) {
          loadUsers();
        }
      }
    );

    // Filter users based on search query
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return users.value;

      const query = searchQuery.value.toLowerCase();
      return users.value.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    });

    // Load available users
    const loadUsers = async () => {
      try {
        loading.value = true;
        error.value = null;

        // 获取角色未分配的用户
        users.value = await getUnassignedUsers(props.roleId);
      } catch (err: any) {
        console.error("Error loading users:", err);
        error.value = err.message || "加载用户列表失败";
      } finally {
        loading.value = false;
      }
    };

    // Handle user selection
    const handleUserSelect = (userId: string) => {
      selectedUserId.value = userId;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!selectedUserId.value) {
        error.value = "请选择要添加的用户";
        return;
      }

      try {
        await props.onSubmit(selectedUserId.value);
      } catch (err: any) {
        error.value = err.message || "添加用户失败";
      }
    };

    return () => (
      <Dialog open={props.isOpen} onUpdate:open={props.onClose}>
        <DialogContent class="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加用户到角色</DialogTitle>
          </DialogHeader>

          <div class="mt-4">
            <div class="relative mb-4">
              <Search class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或邮箱"
                class="pl-8"
                value={searchQuery.value}
                onInput={(e) =>
                  (searchQuery.value = (e.target as HTMLInputElement).value)
                }
              />
            </div>

            {error.value && <div class="text-red-500 mb-4">{error.value}</div>}

            <div class="border rounded-md h-80 overflow-y-auto">
              {loading.value ? (
                <div class="flex items-center justify-center h-full">
                  加载中...
                </div>
              ) : filteredUsers.value.length === 0 ? (
                <div class="flex items-center justify-center h-full text-muted-foreground">
                  {searchQuery.value ? "没有匹配的用户" : "没有可分配的用户"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>选择</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.value.map((user) => (
                      <TableRow
                        key={user.id}
                        class={
                          selectedUserId.value === user.id
                            ? "bg-muted/50"
                            : undefined
                        }
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <TableCell>
                          <div class="flex items-center">
                            <input
                              type="radio"
                              checked={selectedUserId.value === user.id}
                              onChange={() => handleUserSelect(user.id)}
                              class="h-4 w-4"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={props.onClose}>
              取消
            </Button>
            <Button
              disabled={!selectedUserId.value || loading.value}
              onClick={handleSubmit}
            >
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
});
