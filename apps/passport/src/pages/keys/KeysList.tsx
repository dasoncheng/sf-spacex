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
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from "lucide-vue-next";

interface Key {
  id: string;
  name: string;
  type: string;
  createdBy: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export const KeysList = defineComponent({
  name: "KeysList",
  setup() {
    // Mock data for keys
    const keys = ref<Key[]>([
      {
        id: "1",
        name: "Production API Key",
        type: "API",
        createdBy: "John Doe",
        status: "Active",
        createdAt: "2023-05-15",
        expiresAt: "2024-05-15",
      },
      {
        id: "2",
        name: "Development API Key",
        type: "API",
        createdBy: "Jane Smith",
        status: "Active",
        createdAt: "2023-06-20",
        expiresAt: "2024-06-20",
      },
      {
        id: "3",
        name: "Testing Key",
        type: "Secret",
        createdBy: "Bob Johnson",
        status: "Expired",
        createdAt: "2023-07-05",
        expiresAt: "2023-10-05",
      },
      {
        id: "4",
        name: "Backup Key",
        type: "Secret",
        createdBy: "Alice Brown",
        status: "Active",
        createdAt: "2023-08-12",
        expiresAt: "2024-08-12",
      },
      {
        id: "5",
        name: "Webhook Key",
        type: "API",
        createdBy: "Charlie Davis",
        status: "Revoked",
        createdAt: "2023-09-01",
        expiresAt: "2024-09-01",
      },
    ]);

    // Toggle key visibility (would actually show/hide the key value in a real app)
    const visibleKeys = ref<Set<string>>(new Set());
    const toggleKeyVisibility = (id: string) => {
      if (visibleKeys.value.has(id)) {
        visibleKeys.value.delete(id);
      } else {
        visibleKeys.value.add(id);
      }
    };

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Key Management</h1>
          <Button class="flex gap-1 items-center">
            <PlusCircle class="h-4 w-4" />
            Generate New Key
          </Button>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.value.map((key) => (
                <TableRow key={key.id}>
                  <TableCell class="font-medium">{key.name}</TableCell>
                  <TableCell>{key.type}</TableCell>
                  <TableCell>{key.createdBy}</TableCell>
                  <TableCell>
                    <span
                      class={
                        key.status === "Active"
                          ? "inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                          : key.status === "Expired"
                          ? "inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                          : "inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                      }
                    >
                      {key.status}
                    </span>
                  </TableCell>
                  <TableCell>{key.createdAt}</TableCell>
                  <TableCell>{key.expiresAt}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {visibleKeys.value.has(key.id) ? (
                          <EyeOff class="h-4 w-4" />
                        ) : (
                          <Eye class="h-4 w-4" />
                        )}
                        <span class="sr-only">
                          {visibleKeys.value.has(key.id)
                            ? "Hide Key"
                            : "Show Key"}
                        </span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit class="h-4 w-4" />
                        <span class="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 class="h-4 w-4" />
                        <span class="sr-only">Revoke</span>
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
