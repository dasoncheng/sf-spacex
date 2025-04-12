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
import { getApplicationById } from "@/services/applications";
import type { ApplicationDetail as ApplicationDetailType } from "@/types/api";

export const ApplicationDetail = defineComponent({
  name: "ApplicationDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const application = ref<ApplicationDetailType | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Format date to local date string
    const formatDate = (dateString: string | undefined) => {
      return dateString ? new Date(dateString).toLocaleString() : "N/A";
    };

    // Navigate to user detail
    const viewUserDetails = (userId: string) => {
      router.push(`/users/${userId}`);
    };

    // Go back to applications list
    const goBack = () => {
      router.push("/applications");
    };

    // Load application details from API
    const loadApplicationDetails = async () => {
      const appId = route.params.id as string;
      if (!appId) {
        error.value = "Application ID is required";
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        application.value = await getApplicationById(appId);
      } catch (err: any) {
        error.value = err.message || "Failed to load application details";
        console.error("Error loading application details:", err);
      } finally {
        loading.value = false;
      }
    };

    // Load application details on component mount
    onMounted(() => {
      loadApplicationDetails();
    });

    return () => (
      <div>
        <div class="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} class="mr-2">
            <ArrowLeft class="h-4 w-4 mr-1" />
            返回应用列表
          </Button>
          <h1 class="text-2xl font-bold">应用详情</h1>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载应用详情...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : application.value ? (
          <div class="space-y-6">
            {/* Application Info Card */}
            <div class="rounded-lg border bg-card p-6">
              <h2 class="text-xl font-semibold mb-4">应用信息</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">名称</p>
                  <p class="font-medium">{application.value.Name}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">应用 ID</p>
                  <p class="font-medium">{application.value.Id}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">描述</p>
                  <p class="font-medium">
                    {application.value.Description || "N/A"}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">API Key</p>
                  <code class="bg-muted rounded px-2 py-1 text-sm">
                    {application.value.AppKey}
                  </code>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">创建时间</p>
                  <p class="font-medium">
                    {formatDate(application.value.CreatedAt)}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">更新时间</p>
                  <p class="font-medium">
                    {formatDate(application.value.UpdatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div class="rounded-lg border">
              <h2 class="text-xl font-semibold p-4">用户</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>邮箱</TableHead>
                    <TableHead>激活时间</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead class="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {application.value.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} class="text-center py-8">
                        没有用户激活此应用
                      </TableCell>
                    </TableRow>
                  ) : (
                    application.value.users.map((user) => (
                      <TableRow key={user.Id}>
                        <TableCell class="font-medium">{user.Email}</TableCell>
                        <TableCell>{formatDate(user.activatedAt)}</TableCell>
                        <TableCell>
                          {user.expiresAt
                            ? formatDate(user.expiresAt)
                            : "永不过期"}
                        </TableCell>
                        <TableCell class="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewUserDetails(user.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">查看用户详情</span>
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
          <div class="text-center py-8">未找到应用</div>
        )}
      </div>
    );
  },
});
