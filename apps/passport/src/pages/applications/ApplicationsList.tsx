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
import { applicationsService } from "@/services/applicationsService";
import type { Application } from "@/types/api";

export const ApplicationsList = defineComponent({
  name: "ApplicationsList",
  setup() {
    const router = useRouter();
    const applications = ref<Application[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Format date to local date string
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    // Navigate to application detail page
    const viewApplicationDetails = (appId: string) => {
      router.push(`/applications/${appId}`);
    };

    // Load applications from API
    const loadApplications = async () => {
      try {
        loading.value = true;
        applications.value = await applicationsService.getApplications();
      } catch (err: any) {
        error.value = err.message || "Failed to load applications";
        console.error("Error loading applications:", err);
      } finally {
        loading.value = false;
      }
    };

    // Show modal for creating a new application
    const showCreateApplicationModal = () => {
      // This would be implemented with a modal component
      alert("Create application modal would appear here");
    };

    // Load applications on component mount
    onMounted(() => {
      loadApplications();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">应用管理</h1>
          <Button
            class="flex gap-1 items-center"
            onClick={showCreateApplicationModal}
          >
            <PlusCircle class="h-4 w-4" />
            新建应用
          </Button>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载应用中...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : (
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead class="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} class="text-center py-8">
                      未找到应用
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.value.map((app) => (
                    <TableRow key={app.Id}>
                      <TableCell class="font-medium">{app.Name}</TableCell>
                      <TableCell>{app.Description || "N/A"}</TableCell>
                      <TableCell>
                        <code class="bg-muted rounded px-1 py-0.5 text-xs">
                          {app.AppKey}
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(app.CreatedAt)}</TableCell>
                      <TableCell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewApplicationDetails(app.Id)}
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
      </div>
    );
  },
});
