import {
  defineComponent,
  ref,
  provide,
  inject,
  InjectionKey,
  Ref,
  onMounted,
} from "vue";

export interface TabProps {
  id: string;
  label: string;
  icon: any; // Component type for the icon
}

// Create injection keys for tab context
const ActiveTabKey: InjectionKey<Ref<string>> = Symbol("activeTab");
const RegisterTabKey: InjectionKey<
  (id: string, label: string, icon?: any) => void
> = Symbol("registerTab");

// Tab Container Component
export const Tabs = defineComponent({
  name: "Tabs",
  props: {},
  setup(props, { emit, slots }) {
    const activeTab = ref();
    const registeredTabs = ref<TabProps[]>([]);

    // Register a new tab
    const registerTab = (id: string, label: string, icon?: any) => {
      if (!registeredTabs.value.find((tab) => tab.id === id)) {
        registeredTabs.value.push({ id, label, icon });
      }
    };

    // Switch active tab
    const switchTab = (tabId: string) => {
      activeTab.value = tabId;
    };

    // Provide tab context to child components
    provide(ActiveTabKey, activeTab);
    provide(RegisterTabKey, registerTab);

    onMounted(() => {
      if (registeredTabs.value.length > 0) {
        activeTab.value = registeredTabs.value[0].id;
      }
    });

    return () => (
      <div class="flex flex-col h-full">
        <div class="flex border-b border-zinc-800/70 bg-zinc-900/30">
          {registeredTabs.value.map((tab) => (
            <button
              key={tab.id}
              class={`flex items-center px-4 py-15px text-xs font-medium transition-colors
              ${
                activeTab.value === tab.id
                  ? "text-blue-400 border-b-2 border-blue-500 bg-zinc-800/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30"
              }`}
              onClick={() => switchTab(tab.id)}
            >
              {tab.icon && <tab.icon class="mr-1.5 h-3.5 w-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>
        <div class="flex-1 overflow-auto custom-scrollbar">
          {slots.default?.()}
        </div>
      </div>
    );
  },
});

// Tab Component
export const TabPane = defineComponent({
  name: "TabPane",
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: [Object, Function],
    },
  },
  setup(props, { slots }) {
    const activeTab = inject(ActiveTabKey);
    const registerTab = inject(RegisterTabKey);

    // Register this tab with parent
    if (registerTab) {
      registerTab(props.id, props.label, props.icon);
    }

    // Only render content if this tab is active
    return () => (
      <div class={`h-full ${activeTab?.value === props.id ? "" : "hidden"}`}>
        {slots.default?.()}
      </div>
    );
  },
});
