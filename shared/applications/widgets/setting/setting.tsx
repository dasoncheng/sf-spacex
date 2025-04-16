import { computed, defineComponent, PropType, ref } from "vue";
import {
  ChevronUp,
  X,
  Info,
  Settings,
  Paintbrush,
  Code,
  Coins,
  AppWindow,
  Users,
  Sparkles,
  Lightbulb,
  Network,
  HardDrive,
} from "lucide-vue-next";
import { SideType, User } from "./type";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

type ThemeType = "light" | "dark";

const UserInfo = defineComponent({
  name: "UserInfo",
  props: {
    theme: { type: String as () => ThemeType, default: "light" },
    user: { type: Object as PropType<User | null>, required: true },
    activation: { type: Boolean as PropType<boolean>, defualt: false },
    styles: { type: Object as PropType<Record<string, string>> },
  },
  setup(props) {
    return () => (
      <>
        <div class="mb-8">
          <div class="flex items-center mb-4">
            <div class="flex items-center gap-4">
              <div
                class={`w-12 h-12 ${props.styles?.planIconBg} rounded-full flex items-center justify-center`}
              >
                <div
                  class={`w-10 h-10 ${props.styles?.planIconInner} rounded-full`}
                ></div>
              </div>
              <div>
                <div class={props.styles?.secondaryText}>邮箱</div>
                <div class={`text-1xl font-bold ${props.styles?.headingText}`}>
                  {props.user?.Email}
                </div>
              </div>
            </div>
            <div class="ml-auto text-right">
              <div
                class={`${props.styles?.secondaryText} flex items-center justify-end`}
              >
                <div
                  class={`w-3 h-3 ${
                    props.activation ? "bg-blue-500" : "bg-red-500"
                  }  rounded-full mr-2`}
                ></div>
                {props.activation ? "已激活" : "未激活"}
              </div>
            </div>
          </div>
        </div>
        <div class={`border-t ${props.styles?.divider} my-8`}></div>
      </>
    );
  },
});

const ActivationInfo = defineComponent({
  name: "ActivationInfo",
  emits: ["active"],
  props: {
    theme: { type: String as () => ThemeType, default: "light" },
    user: { type: Object as PropType<User | null>, required: true },
    activation: { type: Boolean as PropType<boolean>, defualt: false },
    styles: { type: Object as PropType<Record<string, string>> },
    expiresAt: { type: String as PropType<String | null>, defualt: null },
    activatedAt: { type: String as PropType<String | null>, defualt: null },
  },
  setup(props, { emit }) {
    const error = ref("");

    const always = computed(() => {
      if (props.activation && props.expiresAt === null) {
        return true;
      }
      return false;
    });

    const expiresDate = computed(() => {
      if (typeof props.expiresAt === "string") {
        return (
          format(parseISO(props.expiresAt), "yyyy年MM月dd日 HH:mm:ss") + "到期"
        );
      }
      return "";
    });

    const usedDate = computed(() => {
      if (typeof props.activatedAt === "string") {
        const startDate = parseISO(props.activatedAt);
        const endDate = new Date();
        const daysDifference = differenceInCalendarDays(endDate, startDate);
        return daysDifference;
      }
      return 0;
    });
    const totalDate = computed(() => {
      if (
        typeof props.activatedAt === "string" &&
        typeof props.expiresAt === "string"
      ) {
        const startDate = parseISO(props.activatedAt);
        const endDate = parseISO(props.expiresAt);
        const daysDifference = differenceInCalendarDays(endDate, startDate);
        return daysDifference;
      }
      return 0;
    });
    const percentage = computed(() => {
      if (!usedDate.value) {
        return 0;
      }
      if (usedDate.value === totalDate.value) {
        return 100;
      }
      return usedDate.value / totalDate.value;
    });

    const handleActive = () => {
      if (always.value) {
        error.value = "您的许可证为永久 无需再次激活";
      } else {
        emit("active");
      }
    };

    return () => (
      <>
        {error.value && (
          <div class="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error.value}
          </div>
        )}
        <div
          class={`${
            props.activation ? props.styles?.infoBg : props.styles?.infoWarnBg
          } border ${
            props.activation
              ? props.styles?.infoBorder
              : props.styles?.infoWarnBorder
          } rounded-lg p-6  mb-8`}
        >
          <div class="flex items-start gap-3">
            <Info
              class={`w-5 h-5 ${
                props.activation
                  ? props.styles?.infoIcon
                  : props.styles?.infoWarnIcon
              } mt-1`}
            />
            <div>
              <h2
                class={`text-xl font-medium ${
                  props.activation
                    ? props.styles?.infoTitle
                    : props.styles?.infoWarnTitle
                }`}
              >
                {props.activation ? "已激活" : "未激活"}
              </h2>
              <p class="text-mg mt-2">
                {always.value ? "永久有效" : expiresDate.value}
              </p>
            </div>
          </div>
        </div>

        {!always.value && (
          <div class="mb-8">
            <div class="flex items-center mb-4">
              <div class="flex items-center gap-4 mb-4">
                <div>
                  <div class={props.styles?.secondaryText}>Licence</div>
                  <div
                    class={`text-2xl font-bold ${props.styles?.headingText}`}
                  >
                    许可证
                  </div>
                </div>
              </div>
              <div class="ml-auto text-right">
                <div
                  class={`${props.styles?.secondaryText} flex items-center justify-end`}
                >
                  <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  使用时间
                </div>
                <div class={`text-3xl font-bold ${props.styles?.headingText}`}>
                  {usedDate.value}天/
                  <span class={`${props.styles?.secondaryText} text-xl`}>
                    {totalDate.value}天
                  </span>
                </div>
              </div>
            </div>
            <div
              class={`w-full h-2 ${props.styles?.progressBg} rounded-full overflow-hidden`}
            >
              <div
                class={`h-full ${props.styles?.progressFill} rounded-full`}
                style={{ width: `${percentage.value}%` }}
              ></div>
            </div>
          </div>
        )}

        <div class={`border-t ${props.styles?.divider} my-8`}></div>

        <a
          href="#"
          class={`${props.styles?.infoLink} hover:underline`}
          onClick={handleActive}
        >
          去激活
        </a>
      </>
    );
  },
});

export const Setting = defineComponent({
  name: "Setting",
  emits: ["close", "getActivition", "active"],
  props: {
    theme: { type: String as () => ThemeType, default: "light" },
    user: { type: Object as PropType<User | null>, required: true },
    activation: { type: Boolean as PropType<boolean>, defualt: false },
    expiresAt: { type: String as PropType<String | null>, defualt: null },
    activatedAt: { type: String as PropType<string | null>, defualt: null },
  },
  setup(props, { emit }) {
    const activeIndex = ref(0);
    const close = () => {
      emit("close");
    };
    const handleContentClick = (e: Event) => {
      e.stopPropagation();
    };

    const styles = computed(() => {
      const isDark = props.theme === "dark";
      return {
        // Main containers
        mainBg: isDark ? "bg-black" : "bg-white",
        mainText: isDark ? "text-white" : "text-gray-800",
        headingText: isDark ? "text-white" : "text-gray-900",

        // Sidebar
        sidebarBg: isDark ? "bg-black" : "bg-gray-50",
        sidebarBorder: isDark ? "border-gray-800" : "border-gray-200",
        menuItemHover: isDark ? "hover:bg-gray-800" : "hover:bg-gray-100",
        menuItemActive: isDark ? "bg-gray-800" : "bg-gray-200",
        divider: isDark ? "border-gray-800" : "border-gray-200",

        // Cards and sections
        cardBg: isDark ? "bg-gray-900" : "bg-white",
        cardBorder: isDark ? "border-gray-800" : "border-gray-200",
        cardShadow: isDark ? "" : "shadow-sm",

        // Info section
        infoBg: isDark ? "bg-gray-900" : "bg-blue-50",
        infoBorder: isDark ? "border-gray-800" : "border-blue-100",
        infoWarnBg: isDark ? "bg-red-900" : "bg-red-50",
        infoWarnBorder: isDark ? "border-red-800" : "border-red-100",
        infoTitle: isDark ? "text-blue-400" : "text-blue-700",
        infoWarnTitle: isDark ? "text-red-400" : "text-red-700",
        infoIcon: isDark ? "text-blue-400" : "text-blue-600",
        infoWarnIcon: isDark ? "text-red-400" : "text-red-600",
        infoLink: isDark ? "text-blue-400" : "text-blue-600",

        // Button
        buttonBg: isDark ? "bg-gray-800" : "bg-blue-50",
        buttonHover: isDark ? "hover:bg-gray-700" : "hover:bg-blue-100",
        buttonBorder: isDark ? "border-gray-700" : "border-blue-200",
        buttonText: isDark ? "text-white" : "text-blue-700",

        // Close button
        closeButton: isDark
          ? "text-gray-400 hover:text-white"
          : "text-gray-500 hover:text-gray-700",

        // Secondary text
        secondaryText: isDark ? "text-gray-400" : "text-gray-500",

        // Progress bar
        progressBg: isDark ? "bg-gray-800" : "bg-gray-100",
        progressFill: "bg-blue-500",

        // Plan icon
        planIconBg: isDark ? "bg-green-900" : "bg-green-100",
        planIconInner: isDark ? "bg-green-800" : "bg-green-200",

        // Indicator icons
        indicatorBg: isDark ? "bg-gray-800" : "bg-gray-100",
        indicatorInner: isDark ? "bg-gray-700" : "bg-gray-200",
      };
    });

    const sidebar = computed(() => {
      return [
        {
          title: "用户信息",
          icon: <Users class="w-5 h-5" />,
          sign: SideType.User,
          content: (
            <UserInfo
              theme={props.theme}
              user={props.user}
              activation={props.activation}
              styles={styles.value}
            />
          ),
        },
        {
          title: "激活信息",
          icon: <Sparkles class="w-5 h-5" />,
          sign: SideType.Activation,
          content: (
            <ActivationInfo
              theme={props.theme}
              user={props.user}
              activation={props.activation}
              expiresAt={props.expiresAt}
              activatedAt={props.activatedAt}
              styles={styles.value}
              onActive={() => emit("active")}
            />
          ),
        },
      ];
    });

    return () => (
      <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={close}
      >
        <div
          class={`flex h-50% ${styles.value.mainBg} ${styles.value.mainText} rounded-xl overflow-hidden`}
          onClick={handleContentClick}
        >
          <div
            class={`w-60 border-r ${styles.value.sidebarBorder} p-4 ${styles.value.sidebarBg}`}
          >
            <div class="space-y-4">
              {sidebar.value.map((item, index) => (
                <div
                  class={`flex items-center gap-3 p-2 rounded-md ${
                    activeIndex.value === index
                      ? styles.value.menuItemActive
                      : styles.value.menuItemHover
                  } cursor-pointer`}
                  onClick={() => {
                    activeIndex.value = index;
                    if (SideType.Activation === item.sign) {
                      emit("getActivition");
                    }
                  }}
                >
                  {item.icon}
                  <span class="font-medium">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div class="flex-1 relative pt-4 overflow-hidden w-140">
            <div class="pr-8 pl-8 flex items-center justify-between">
              <h1 class={`text-2xl font-bold ${styles.value.headingText}`}>
                {sidebar.value[activeIndex.value].title}
              </h1>
              <button class={styles.value.closeButton} onClick={close}>
                <X class="w-6 h-6" />
              </button>
            </div>
            <div class="p-8  max-w-5xl h-100% overflow-auto">
              {sidebar.value[activeIndex.value].content}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
