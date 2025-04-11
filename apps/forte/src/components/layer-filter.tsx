import { defineComponent, PropType } from "vue";
import { ResourceConfig, ActOutput, ActDir } from "../models/act";
import { CheckboxGroup, CheckboxGroupItem } from "../widgets/checkbox-group";

const actDirLabels: Record<ActDir, string> = {
  [ActDir.None]: "未知",
  [ActDir.Up]: "上",
  [ActDir.UpRight]: "右上",
  [ActDir.Right]: "右",
  [ActDir.DownRight]: "右下",
  [ActDir.Down]: "下",
  [ActDir.DownLeft]: "左下",
  [ActDir.Left]: "左",
  [ActDir.UpLeft]: "左上",
};

export const LayerFilter = defineComponent({
  name: "LayerFilter",
  props: {
    filter: {
      type: Object as PropType<{
        acts: string[];
        dirs: ActDir[];
      }>,
      required: true,
    },
    config: {
      type: Object as PropType<ResourceConfig>,
      required: true,
    },
  },
  emits: ["update:filter"],
  setup(props, { emit }) {
    return () => (
      <div class="my-3 space-y-2 text-zinc-350">
        <div class="flex items-start space-x-2">
          <h2 class="text-12px">动作：</h2>
          <CheckboxGroup
            modelValue={props.filter.acts}
            onUpdate:modelValue={(val) => {
              emit("update:filter", {
                ...props.filter,
                acts: val,
              });
            }}
            direction="horizontal"
          >
            {Object.entries(ActOutput)
              .filter(([key]) => isNaN(Number(key)))
              .map(([key, value]) => (
                <CheckboxGroupItem key={key} value={value} label={value} />
              ))}
          </CheckboxGroup>
        </div>

        <div class="flex items-start space-x-2">
          <h2 class="text-12px">朝向：</h2>
          <CheckboxGroup
            modelValue={props.filter.dirs}
            onUpdate:modelValue={(val) => {
              emit("update:filter", {
                ...props.filter,
                dirs: val,
              });
            }}
            direction="horizontal"
          >
            {Object.entries(ActDir)
              .filter(([key]) => isNaN(Number(key)))
              .map(([key, value]) => (
                <CheckboxGroupItem
                  key={value}
                  value={value}
                  label={actDirLabels[value as ActDir] || key}
                />
              ))}
          </CheckboxGroup>
        </div>
      </div>
    );
  },
});
