import { defineComponent, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-vue-next";
import { getLicenseById } from "@/services/licenses";
import type { LicenseDetail as LicenseDetailType } from "@/types/api";

export const LicenseDetail = defineComponent({
  name: "LicenseDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const license = ref<LicenseDetailType | null>(null);
    const loading = ref(true);
    const error = ref<string | null>(null);

    // Format date to local date string
    const formatDate = (dateString: string | undefined) => {
      return dateString ? new Date(dateString).toLocaleString() : "N/A";
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

    // Navigate to user detail
    const viewUserDetails = (userId: string) => {
      router.push(`/users/${userId}`);
    };

    // Navigate to application detail
    const viewApplicationDetails = (applicationId: string) => {
      router.push(`/applications/${applicationId}`);
    };

    // Go back to licenses list
    const goBack = () => {
      router.push("/licenses");
    };

    // Load license details from API
    const loadLicenseDetails = async () => {
      const licenseId = route.params.id as string;
      if (!licenseId) {
        error.value = "License ID is required";
        loading.value = false;
        return;
      }

      try {
        loading.value = true;
        license.value = await getLicenseById(licenseId);
      } catch (err: any) {
        error.value = err.message || "Failed to load license details";
        console.error("Error loading license details:", err);
      } finally {
        loading.value = false;
      }
    };

    // Load license details on component mount
    onMounted(() => {
      loadLicenseDetails();
    });

    return () => (
      <div>
        <div class="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} class="mr-2">
            <ArrowLeft class="h-4 w-4 mr-1" />
            Back to Licenses
          </Button>
          <h1 class="text-2xl font-bold">License Details</h1>
        </div>

        {loading.value ? (
          <div class="text-center py-8">Loading license details...</div>
        ) : error.value ? (
          <div class="text-center py-8 text-red-500">{error.value}</div>
        ) : license.value ? (
          <div class="space-y-6">
            {/* License Info Card */}
            <div class="rounded-lg border bg-card p-6">
              <h2 class="text-xl font-semibold mb-4">License Information</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-muted-foreground">License Key</p>
                  <code class="bg-muted rounded px-2 py-1 text-sm font-mono">
                    {license.value.LicenseKey}
                  </code>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Status</p>
                  <span
                    class={
                      license.value.IsUsed
                        ? "inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                        : "inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                    }
                  >
                    {license.value.IsUsed ? "Used" : "Available"}
                  </span>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Duration</p>
                  <p class="font-medium">
                    {formatDuration(license.value.ExpiresAt)}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">License ID</p>
                  <p class="font-medium">{license.value.Id}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Created At</p>
                  <p class="font-medium">
                    {formatDate(license.value.CreatedAt)}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Updated At</p>
                  <p class="font-medium">
                    {formatDate(license.value.UpdatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Activation Details */}
            {license.value.activation ? (
              <div class="rounded-lg border bg-card p-6">
                <h2 class="text-xl font-semibold mb-4">Activation Details</h2>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-muted-foreground">User</p>
                    <div class="flex items-center gap-2">
                      <p class="font-medium">
                        {license.value.activation.user.Email}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          viewUserDetails(license.value!.activation!.user.Id)
                        }
                      >
                        <ExternalLink class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Application</p>
                    <div class="flex items-center gap-2">
                      <p class="font-medium">
                        {license.value.activation.application.Name}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          viewApplicationDetails(
                            license.value!.activation!.application.Id
                          )
                        }
                      >
                        <ExternalLink class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">
                      Device Fingerprint
                    </p>
                    <code class="bg-muted rounded px-2 py-1 text-sm font-mono">
                      {license.value.activation.Fingerprint}
                    </code>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Activated At</p>
                    <p class="font-medium">
                      {formatDate(license.value.activation.ActivatedAt)}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-muted-foreground">Expires At</p>
                    <p class="font-medium">
                      {license.value.activation.ExpiresAt
                        ? formatDate(license.value.activation.ExpiresAt)
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div class="rounded-lg border bg-card p-6 text-center">
                <h2 class="text-xl font-semibold mb-2">
                  License Not Activated
                </h2>
                <p class="text-muted-foreground">
                  This license has not been activated by any user yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div class="text-center py-8">License not found</div>
        )}
      </div>
    );
  },
});
