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
import { licensesService } from "@/services/licensesService";
import type {
  BatchCreateLicenseDto,
  CreateLicenseDto,
  License,
} from "@/types/api";
import { CreateLicensesModal } from "./CreateLicensesModal";

export const LicensesList = defineComponent({
  name: "LicensesList",
  setup() {
    const router = useRouter();
    const licenses = ref<License[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const isCreateModalOpen = ref<boolean>(false);
    const isCreateSingle = ref<boolean>(true);

    // Format date to local date string
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString();
    };

    // Format duration from seconds to human-readable format
    const formatDuration = (seconds: number | undefined) => {
      if (!seconds) return "Unlimited";

      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);

      if (days > 0) {
        return `${days} ${days === 1 ? "day" : "days"}${
          hours > 0 ? `, ${hours} ${hours === 1 ? "hour" : "hours"}` : ""
        }`;
      }

      if (hours > 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }

      const minutes = Math.floor((seconds % 3600) / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    };

    // Load licenses from API
    const loadLicenses = async () => {
      try {
        loading.value = true;
        licenses.value = await licensesService.getLicenses();
      } catch (err: any) {
        error.value = err.message || "Failed to load licenses";
        console.error("Error loading licenses:", err);
      } finally {
        loading.value = false;
      }
    };

    // Show modal for creating a new license
    const showCreateLicenseModal = () => {
      isCreateSingle.value = true;
      isCreateModalOpen.value = true;
    };

    // Show modal for batch creating licenses
    const showBatchCreateModal = () => {
      isCreateSingle.value = false;
      isCreateModalOpen.value = true;
    };

    const handleLicensesCreated = async (licensesData: CreateLicenseDto) => {
      try {
        await licensesService.createLicense(licensesData);
        await loadLicenses();
        isCreateModalOpen.value = false;
      } catch (err: any) {
        console.error("Error creating Licenses:", err);
        error.value = err.message || "Failed to create Licenses";
      }
    };

    const handleLicensesCreatedBatch = async (
      licensesData: BatchCreateLicenseDto
    ) => {
      try {
        await licensesService.batchCreateLicenses(licensesData);
        await loadLicenses();
        isCreateModalOpen.value = false;
      } catch (err: any) {
        console.error("Error creating Licenses:", err);
        error.value = err.message || "Failed to create Licenses";
      }
    };

    // Load licenses on component mount
    onMounted(() => {
      loadLicenses();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">许可证管理</h1>
          <div class="flex gap-2">
            <Button
              class="flex gap-1 items-center"
              onClick={showCreateLicenseModal}
            >
              <PlusCircle class="h-4 w-4" />
              新建许可证
            </Button>
            <Button variant="outline" onClick={showBatchCreateModal}>
              批量生成
            </Button>
          </div>
        </div>

        {loading.value ? (
          <div class="text-center py-8">加载许可证中...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : (
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>许可证 Key</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} class="text-center py-8">
                      未找到许可证
                    </TableCell>
                  </TableRow>
                ) : (
                  licenses.value.map((license) => (
                    <TableRow key={license.Id}>
                      <TableCell class="font-mono text-xs">
                        {license.LicenseKey}
                      </TableCell>
                      <TableCell>
                        <span
                          class={
                            license.IsUsed
                              ? "inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                              : "inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                          }
                        >
                          {license.IsUsed ? "已使用" : "可用"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDuration(license.ExpiresAt)}</TableCell>
                      <TableCell>{formatDate(license.CreatedAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <CreateLicensesModal
          isSingle={isCreateSingle.value}
          isOpen={isCreateModalOpen.value}
          onClose={() => (isCreateModalOpen.value = false)}
          onSubmit={handleLicensesCreated}
          onSublitBatch={handleLicensesCreatedBatch}
        />
      </div>
    );
  },
});
