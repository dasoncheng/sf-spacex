import { defineComponent, computed, PropType, inject } from "vue";
import { Check, Minus } from "lucide-vue-next";
import { CheckboxGroupContextKey } from "./checkbox-group";

export interface CheckboxProps {
  modelValue?: boolean | null;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export const Checkbox = defineComponent({
  name: "Checkbox",
  props: {
    modelValue: {
      type: [Boolean, null] as PropType<boolean | null>,
      default: false,
    },
    label: { type: String },
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    id: { type: String },
    name: { type: String },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    // Try to inject group context
    const group = inject(CheckboxGroupContextKey, null);

    const id = computed(
      () => props.id ?? `checkbox-${Math.random().toString(36).substr(2, 9)}`
    );
    const isChecked = computed(() => {
      return props.indeterminate ? null : props.modelValue;
    });

    const toggleCheckbox = () => {
      if (props.disabled) return;
      const newValue = !props.modelValue;
      emit("update:modelValue", newValue);
      emit("change", newValue);
    };

    return () => (
      <div class="flex items-center space-x-2">
        <div
          role="checkbox"
          aria-checked={isChecked.value === null ? "mixed" : isChecked.value}
          aria-disabled={props.disabled}
          tabindex={props.disabled ? -1 : 0}
          id={id.value}
          class={[
            "h-4 w-4 shrink-0 rounded-sm border border-neutral-300 shadow",
            "focus:outline-none", // Removed the ring effect here
            props.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            isChecked.value ? "bg-primary-600 text-white" : "",
            props.indeterminate ? "bg-primary-600 text-white" : "",
            "transition-colors",
          ]}
          onClick={toggleCheckbox}
          onKeydown={(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCheckbox();
            }
          }}
        >
          <div class="flex items-center justify-center text-current">
            {props.indeterminate ? (
              <Minus class="h-3 w-3" />
            ) : isChecked.value ? (
              <Check class="h-3 w-3" />
            ) : null}
          </div>
        </div>
        {props.label && (
          <label
            for={id.value}
            onClick={toggleCheckbox}
            class={[
              "text-12px font-medium leading-none",
              props.disabled
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer",
            ]}
          >
            {props.label}
          </label>
        )}
      </div>
    );
  },
});

export default Checkbox;
