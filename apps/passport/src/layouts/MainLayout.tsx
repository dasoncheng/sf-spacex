import { defineComponent } from "vue";
import { Navigation } from "@/components/Navigation";
import { RouterView } from "vue-router";

export const MainLayout = defineComponent({
  name: "MainLayout",
  setup() {
    return () => (
      <div class="min-h-screen flex">
        {/* Sidebar */}
        <div class="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
          <div class="p-4">
            <h1 class="text-xl font-bold mb-6">Passport</h1>
            <Navigation />
          </div>
        </div>

        {/* Content area */}
        <main class="flex-1 p-6 overflow-auto">
          <RouterView />
        </main>
      </div>
    );
  },
});
