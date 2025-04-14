import { defineComponent } from "vue";
import { Navigation } from "@/components/Navigation";
import { RouterView } from "vue-router";
import { UserMenu } from "@/components/UserMenu";

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
        <main class="flex-1 overflow-auto">
          <header class="border-b">
            <div class="container flex justify-end items-center pb-2">
              <UserMenu />
            </div>
          </header>
          <div class="p-6 overflow-auto">
            <RouterView />
          </div>
        </main>
      </div>
    );
  },
});
