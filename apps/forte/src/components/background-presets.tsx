import { defineComponent, ref, PropType } from "vue";
import { X, Plus } from "lucide-vue-next";

export interface BackgroundPreset {
  id: string;
  name: string;
  color: string;
}

export interface CustomBackground {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
}

export const BackgroundPresets = defineComponent({
  name: "BackgroundPresets",
  props: {
    backgroundPresets: {
      type: Array as PropType<BackgroundPreset[]>,
      required: true,
    },
    customBackgrounds: {
      type: Array as PropType<CustomBackground[]>,
      default: () => [],
    },
    selectedBackground: {
      type: String,
      default: "special",
    },
  },
  emits: [
    "update:selectedBackground",
    "addCustomBackground",
    "removeCustomBackground",
  ],
  setup(props, { emit }) {
    const fileInputRef = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);

    const handlePresetClick = (presetId: string) => {
      emit("update:selectedBackground", presetId);
    };

    const handleCustomBackgroundClick = (backgroundId: string) => {
      emit("update:selectedBackground", backgroundId);
    };

    const handleRemoveCustomBackground = (
      event: Event,
      backgroundId: string
    ) => {
      event.stopPropagation();
      emit("removeCustomBackground", backgroundId);
    };

    const triggerFileInput = () => {
      fileInputRef.value?.click();
    };

    const handleFileChange = (event: Event) => {
      const fileInput = event.target as HTMLInputElement;
      const files = fileInput.files;

      if (files && files.length > 0) {
        handleUploadedFiles(files);
      }

      // Reset the input so the same file can be selected again
      fileInput.value = "";
    };

    const handleUploadedFiles = (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            if (imageUrl) {
              // Pre-load the image to ensure it's cached
              const img = new Image();
              img.onload = () => {
                const newBackground: CustomBackground = {
                  id: `custom-${Date.now()}-${i}`,
                  name: file.name.split(".")[0],
                  url: imageUrl,
                  width: img.width,
                  height: img.height,
                };
                emit("addCustomBackground", newBackground);
              };
              img.src = imageUrl;
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    return () => (
      <div>
        {/* Preset backgrounds grid */}
        <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {props.backgroundPresets.map((preset) => (
            <button
              key={preset.id}
              class={`flex h-16 flex-col items-center justify-center rounded-md bg-gradient-to-br ${
                preset.color
              } border transition-all ${
                props.selectedBackground === preset.id
                  ? "border-blue-500 shadow-md shadow-blue-900/30 ring-1 ring-blue-500/30"
                  : "border-zinc-700/30 hover:border-zinc-600 hover:ring-1 hover:ring-zinc-500/20"
              }`}
              onClick={() => handlePresetClick(preset.id)}
            >
              <span class="text-xs font-medium text-white drop-shadow-sm">
                {preset.name}
              </span>
            </button>
          ))}
          {props.customBackgrounds.map((background) => (
            <div
              key={background.id}
              class={`group relative h-16 overflow-hidden rounded-md border transition-all ${
                props.selectedBackground === background.id
                  ? "border-blue-500 shadow-md shadow-blue-900/30 ring-1 ring-blue-500/30"
                  : "border-zinc-700/30 hover:border-zinc-600 hover:ring-1 hover:ring-zinc-500/20"
              }`}
              onClick={() => handleCustomBackgroundClick(background.id)}
            >
              <img
                src={background.url}
                class="h-full w-full object-cover opacity-70"
                alt={background.name}
                data-bg-id={background.id} // Add data attribute for easier identification
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                <span class="max-w-full truncate px-2 text-xs font-medium text-white">
                  {background.name}
                </span>
              </div>
              <button
                class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-900/80 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100"
                onClick={(e) => handleRemoveCustomBackground(e, background.id)}
              >
                <X class="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add background button */}
          <button
            class="flex h-16 flex-col items-center justify-center rounded-md border border-dashed border-zinc-700/40 bg-zinc-800/20 text-zinc-500 transition-all hover:border-blue-600/30 hover:text-blue-400"
            onClick={triggerFileInput}
          >
            <Plus class="mb-1 h-5 w-5" />
            <span class="text-xs">添加背景</span>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          class="hidden"
          onChange={handleFileChange}
          multiple
        />
      </div>
    );
  },
});
