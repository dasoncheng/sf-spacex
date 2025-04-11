import {
  defineComponent,
  PropType,
  provide,
  InjectionKey,
  computed,
  inject,
} from "vue";
import { Checkbox } from "./checkbox";

// Create a context key for checkbox group communication
export const CheckboxGroupContextKey: InjectionKey<{
  name?: string;
  modelValue: any[];
  disabled?: boolean;
  toggleValue: (value: any) => void;
  isChecked: (value: any) => boolean;
}> = Symbol("CheckboxGroupContext");

export interface CheckboxGroupProps {
  modelValue: any[];
  name?: string;
  label?: string;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
}

export const CheckboxGroup = defineComponent({
  name: "CheckboxGroup",
  props: {
    modelValue: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    name: { type: String },
    label: { type: String },
    disabled: { type: Boolean, default: false },
    direction: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "vertical",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    const toggleValue = (value: any) => {
      const newValue = [...props.modelValue];
      const index = newValue.findIndex((item) =>
        typeof value === "object" && value !== null
          ? JSON.stringify(item) === JSON.stringify(value)
          : item === value
      );

      if (index === -1) {
        newValue.push(value);
      } else {
        newValue.splice(index, 1);
      }

      emit("update:modelValue", newValue);
    };

    const isChecked = (value: any) => {
      return props.modelValue.some((item) =>
        typeof value === "object" && value !== null
          ? JSON.stringify(item) === JSON.stringify(value)
          : item === value
      );
    };

    // Provide context for child checkboxes
    provide(CheckboxGroupContextKey, {
      name: props.name,
      modelValue: props.modelValue,
      disabled: props.disabled,
      toggleValue,
      isChecked,
    });

    return () => (
      <div
        role="group"
        aria-labelledby={props.label ? "checkbox-group-label" : undefined}
        class="checkbox-group"
      >
        {props.label && (
          <div id="checkbox-group-label" class="mb-2 text-sm font-medium">
            {props.label}
          </div>
        )}
        <div
          class={[
            "flex",
            props.direction === "horizontal"
              ? "flex-row flex-wrap gap-x-4"
              : "flex-col gap-y-2",
          ]}
        >
          {slots.default?.()}
        </div>
      </div>
    );
  },
});

// Create a CheckboxGroupItem component for use within the group
export const CheckboxGroupItem = defineComponent({
  name: "CheckboxGroupItem",
  props: {
    value: {
      type: [String, Number, Boolean, Object] as PropType<any>,
      required: true,
    },
    label: { type: String },
    disabled: { type: Boolean },
  },
  setup(props) {
    const group = inject(CheckboxGroupContextKey, null);

    if (!group) {
      console.error("CheckboxGroupItem must be used inside a CheckboxGroup");
      return () => null;
    }

    const checked = computed(() => group.isChecked(props.value));
    const disabled = computed(() => props.disabled || group.disabled);

    const handleChange = (value: boolean) => {
      if (value !== checked.value) {
        group.toggleValue(props.value);
      }
    };

    return () => (
      <Checkbox
        modelValue={checked.value}
        onChange={handleChange}
        label={props.label}
        disabled={disabled.value}
        name={group.name}
      />
    );
  },
});

export default CheckboxGroup;
