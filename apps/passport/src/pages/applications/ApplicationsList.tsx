import { defineComponent, ref } from "vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Play, Pause } from "lucide-vue-next";

interface Application {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: string;
  apiUsage: number;
  createdAt: string;
}

export const ApplicationsList = defineComponent({
  name: "ApplicationsList",
  setup() {
    // Mock data for applications
    const applications = ref<Application[]>([
      {
        id: "1",
        name: "Customer Portal",
        description: "Main customer portal application",
        owner: "Sales Team",
        status: "Active",
        apiUsage: 12453,
        createdAt: "2023-01-15",
      },
      {
        id: "2",
        name: "Analytics Dashboard",
        description: "Internal analytics dashboard",
        owner: "Data Science",
        status: "Active",
        apiUsage: 5672,
        createdAt: "2023-03-22",
      },
      {
        id: "3",
        name: "Mobile API",
        description: "Backend for mobile applications",
        owner: "Mobile Team",
        status: "Maintenance",
        apiUsage: 23456,
        createdAt: "2023-04-10",
      },
      {
        id: "4",
        name: "Legacy Integration",
        description: "Legacy system integration service",
        owner: "Integration Team",
        status: "Inactive",
        apiUsage: 320,
        createdAt: "2022-10-05",
      },
      {
        id: "5",
        name: "Marketing Site",
        description: "Marketing website and blog",
        owner: "Marketing",
        status: "Active",
        apiUsage: 1897,
        createdAt: "2023-05-30",
      },
    ]);

    const toggleApplicationStatus = (appId: string) => {
      const app = applications.value.find(a => a.id === appId);
      if (app) {
        app.status = app.status === "Active" ? "Inactive" : "Active";
      }
    };

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Application Management</h1>
          <Button class="flex gap-1 items-center">
            <PlusCircle class="h-4 w-4" />
            New Application
          </Button>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Usage</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.value.map((app) => (
                <TableRow key={app.id}>
                  <TableCell class="font-medium">{app.name}</TableCell>
                  <TableCell>{app.description}</TableCell>
                  <TableCell>{app.owner}</TableCell>
                  <TableCell>
                    <span
                      class={
                        app.status === "Active"
                          ? "inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                          : app.status === "Maintenance"
                          ? "inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                          : "inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                      }
                    >
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell>{app.apiUsage.toLocaleString()}</TableCell>
                  <TableCell>{app.createdAt}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleApplicationStatus(app.id)}
                      >
                        {app.status === "Active" ? (
                          <Pause class="h-4 w-4" />
                        ) : (
                          <Play class="h-4 w-4" />
                        )}
                        <span class="sr-only">
                          {app.status === "Active" ? "Deactivate" : "Activate"}
                        </span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit class="h-4 w-4" />
                        <span class="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 class="h-4 w-4" />
                        <span class="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
});
