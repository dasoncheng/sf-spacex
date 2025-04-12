import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Users,
  Key,
  Package,
  Settings,
  KeyRound,
  Shield,
} from "lucide-vue-next";

export const Navigation = defineComponent({
  name: "Navigation",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const navItems = [
      {
        title: "用户",
        path: "/users",
        icon: Users,
      },
      {
        title: "应用",
        path: "/applications",
        icon: Package,
      },
      {
        title: "卡密",
        path: "/licenses",
        icon: KeyRound,
      },
      {
        title: "角色管理",
        path: "/roles",
        icon: Shield,
      },
    ];

    const isActive = (path: string) => {
      return route.path === path || route.path.startsWith(`${path}/`);
    };

    const navigateTo = (path: string) => {
      router.push(path);
    };

    return () => (
      <nav class="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigateTo(item.path)}
            class={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon class="h-5 w-5 mr-2" />
            {item.title}
          </button>
        ))}
      </nav>
    );
  },
});
