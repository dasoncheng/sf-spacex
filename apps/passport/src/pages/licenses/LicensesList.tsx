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
import { licensesService } from "@/services/licensesService";
import type { License } from "@/types/api";

export const LicensesList = defineComponent({
  name: "LicensesList",
  setup() {
    const router = useRouter();
    const licenses = ref<License[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);

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

    // Navigate to license detail page
    const viewLicenseDetails = (licenseId: string) => {
      router.push(`/licenses/${licenseId}`);
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
      // This would be implemented with a modal component
      alert("Create license modal would appear here");
    };

    // Show modal for batch creating licenses
    const showBatchCreateModal = () => {
      // This would be implemented with a modal component
      alert("Batch create licenses modal would appear here");
    };

    // Load licenses on component mount
    onMounted(() => {
      loadLicenses();
    });

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">License Management</h1>
          <div class="flex gap-2">
            <Button
              class="flex gap-1 items-center"
              onClick={showCreateLicenseModal}
            >
              <PlusCircle class="h-4 w-4" />
              New License
            </Button>
            <Button variant="outline" onClick={showBatchCreateModal}>
              Batch Generate
            </Button>
          </div>
        </div>

        {loading.value ? (
          <div class="text-center py-8">Loading licenses...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : (
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.value.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} class="text-center py-8">
                      No licenses found
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
                          {license.IsUsed ? "Used" : "Available"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDuration(license.ExpiresAt)}</TableCell>
                      <TableCell>{formatDate(license.CreatedAt)}</TableCell>
                      <TableCell class="text-right">
                        <div class="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewLicenseDetails(license.Id)}
                          >
                            <ExternalLink class="h-4 w-4" />
                            <span class="sr-only">View Details</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 class="h-4 w-4" />
                            <span class="sr-only">Revoke</span>
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
