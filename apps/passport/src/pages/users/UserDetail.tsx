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
import { ArrowLeft, ExternalLink } from "lucide-vue-next";
import { usersService } from "@/services/usersService";
import type { UserDetail as UserDetailType } from "@/types/api";

export const UserDetail = defineComponent({
  name: "UserDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const user = ref<UserDetailType | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Format date to local date string
    const formatDate = (dateString: string | undefined) => {
      return dateString ? new Date(dateString).toLocaleString() : "N/A";
    };

    // Navigate to application detail
    const viewApplicationDetails = (applicationId: string) => {
      router.push(`/applications/${applicationId}`);
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
        user.value = await usersService.getUserById(userId);
      } catch (err: any) {
        error.value = err.message || "Failed to load user details";
        console.error("Error loading user details:", err);
      } finally {
        loading.value = false;
      }
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
                          {app.expiresAt ? formatDate(app.expiresAt) : "永不过期"}
                        </TableCell>
                        <TableCell class="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewApplicationDetails(app.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">
                              查看应用详情
                            </span>
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
      </div>
    );
  },
});
