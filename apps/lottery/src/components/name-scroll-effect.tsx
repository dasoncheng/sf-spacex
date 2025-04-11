import { defineComponent, ref, watch, onBeforeUnmount, PropType } from "vue";

export const NameScrollEffect = defineComponent({
  name: "NameScrollEffect",
  props: {
    names: {
      type: Array as PropType<string[]>,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const displayName = ref<string>("");
    const animationInterval = ref<number | null>(null);
    const scrollSpeed = ref(50); // ms between name changes

    const startScrolling = () => {
      if (animationInterval.value) {
        window.clearInterval(animationInterval.value);
      }

      if (props.names.length === 0) return;

      animationInterval.value = window.setInterval(() => {
        // Randomly select a name from the array
        const randomIndex = Math.floor(Math.random() * props.names.length);
        displayName.value = props.names[randomIndex];
      }, scrollSpeed.value);
    };

    const stopScrolling = () => {
      if (animationInterval.value) {
        window.clearInterval(animationInterval.value);
        animationInterval.value = null;
      }
    };

    watch(
      () => props.isActive,
      (isActive) => {
        if (isActive) {
          startScrolling();
        } else {
          stopScrolling();
        }
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      stopScrolling();
    });

    return () => <span class="font-bold">{displayName.value}</span>;
  },
});
