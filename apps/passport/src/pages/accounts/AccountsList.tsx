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
import { PlusCircle, Edit, Trash2 } from "lucide-vue-next";

interface Account {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const AccountsList = defineComponent({
  name: "AccountsList",
  setup() {
    // Mock data for accounts
    const accounts = ref<Account[]>([
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "Admin",
        status: "Active",
        createdAt: "2023-05-15",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "User",
        status: "Active",
        createdAt: "2023-06-20",
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        role: "Manager",
        status: "Inactive",
        createdAt: "2023-07-05",
      },
      {
        id: "4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        role: "User",
        status: "Active",
        createdAt: "2023-08-12",
      },
      {
        id: "5",
        name: "Charlie Davis",
        email: "charlie.davis@example.com",
        role: "Manager",
        status: "Active",
        createdAt: "2023-09-01",
      },
    ]);

    return () => (
      <div>
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">账户管理</h1>
          <Button class="flex gap-1 items-center">
            <PlusCircle class="h-4 w-4" />
            添加账户
          </Button>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.value.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.role}</TableCell>
                  <TableCell>
                    <span
                      class={
                        account.status === "Active"
                          ? "inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                      }
                    >
                      {account.status}
                    </span>
                  </TableCell>
                  <TableCell>{account.createdAt}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
});
