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
import { getApplications, createApplication } from "@/services/applications";
import type { Application } from "@/types/api";
import { CreateApplicationModal } from "./CreateApplicationModal";

export const ApplicationsList = defineComponent({
  name: "ApplicationsList",
  setup() {
    const router = useRouter();
    const applications = ref<Application[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const isCreateModalOpen = ref(false);

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
        applications.value = await getApplications();
      } catch (err: any) {
        error.value = err.message || "Failed to load applications";
        console.error("Error loading applications:", err);
      } finally {
        loading.value = false;
      }
    };

    // Show modal for creating a new application
    const showCreateApplicationModal = () => {
      isCreateModalOpen.value = true;
    };

    const handleApplicationCreated = async (applicationData: {
      Name: string;
      Description: string;
    }) => {
      try {
        // Call API to create application
        await createApplication(applicationData);
        await loadApplications();
        // Close modal
        isCreateModalOpen.value = false;
      } catch (err: any) {
        console.error("Error creating application:", err);
        error.value = err.message || "Failed to create application";
      }
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
                  <TableHead>AppID</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead class="text-right">查看</TableHead>
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
                          {app.Id}
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(app.CreatedAt)}</TableCell>
                      <TableCell class="text-right">
                        <div class="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewApplicationDetails(app.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">查看详情</span>
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

        <CreateApplicationModal
          isOpen={isCreateModalOpen.value}
          onClose={() => (isCreateModalOpen.value = false)}
          onSubmit={handleApplicationCreated}
        />
      </div>
    );
  },
});
