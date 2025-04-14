import { defineComponent } from "vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/store/auth";

export const UserMenu = defineComponent({
  name: "UserMenu",
  setup() {
    const authStore = useAuthStore();

    return () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            p-id="1907"
            width="30"
            height="30"
          >
            <path
              d="M512 0c281.6 0 512 230.4 512 512s-230.4 512-512 512-512-230.4-512-512 230.4-512 512-512z m115.2 505.6c44.8-38.4 76.8-89.6 76.8-153.6 0-108.8-83.2-192-192-192s-192 83.2-192 192c0 64 32 115.2 76.8 153.6-102.4 44.8-172.8 147.2-172.8 262.4 0 19.2 12.8 32 32 32s32-12.8 32-32c0-121.6 102.4-224 224-224s224 102.4 224 224c0 19.2 12.8 32 32 32s32-12.8 32-32c0-115.2-70.4-217.6-172.8-262.4zM512 480c-70.4 0-128-57.6-128-128s57.6-128 128-128 128 57.6 128 128-57.6 128-128 128z"
              fill="#777777"
              p-id="1908"
            ></path>
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem onClick={authStore.logout} class="text-red-600">
            <LogOut class="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});
