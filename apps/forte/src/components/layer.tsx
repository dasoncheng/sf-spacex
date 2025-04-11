import {
  defineComponent,
  ref,
  onBeforeMount,
  onMounted,
  onUnmounted,
  PropType,
  watch,
  computed,
} from "vue";
import { LayerItem } from "./layer-list";
import { FrameStatus } from "../pages/editor";
import { ResourceFrame } from "../utils/resource";
import { ActDir, ActOutput, ResourceConfig } from "../models/act";
enum Status {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export const Layer = defineComponent({
  props: {
    value: {
      type: Object as () => LayerItem,
      required: true,
    },
    speed: { type: Number, required: true },
    status: { type: Number as PropType<FrameStatus>, required: true },
    filter: {
      type: Object as PropType<{
        acts: ActOutput[];
        dirs: ActDir[];
      }>,
      required: true,
    },
  },
  setup(props) {
    const resourceFrame = ref<ResourceFrame>();
    const status = ref(Status.Loading);
    const currentIndex = ref(0);
    const animationFrameId = ref<number | null>(null);
    const lastFrameTime = ref(0);
    const isAnimating = ref(false);

    // Calculate frame metadata based on the config - updated to handle pre-filtered frames
    const frameMetadata = computed(() => {
      if (!props.value.config) {
        console.log("No config found for layer:", props.value.name);
        return [];
      }

      const config = props.value.config as ResourceConfig;
      const result: Array<{ act: ActOutput | null; dir: ActDir | null }> = [];

      // Initialize all frames with null values
      for (let i = 0; i < props.value.images.length; i++) {
        result.push({ act: null, dir: null });
      }

      try {
        // Create a map to track which frames from the original resource are included in our filtered set
        const includedFrameIndices: number[] = [];

        // For each action in the config
        config.Actions.forEach((action) => {
          const actionFramesPerDir = action.Frame + action.Skip;

          // For each direction
          for (let dirIndex = 0; dirIndex < action.Dir; dirIndex++) {
            // For each frame (only real frames, not skip frames)
            for (
              let frameOffset = 0;
              frameOffset < action.Frame;
              frameOffset++
            ) {
              const originalFrameIndex =
                action.Start + dirIndex * actionFramesPerDir + frameOffset;
              includedFrameIndices.push(originalFrameIndex);
            }
          }
        });

        // Sort included indices to match their original order
        includedFrameIndices.sort((a, b) => a - b);

        // Map the original frame indices to our current images array indices
        let currentIdx = 0;
        config.Actions.forEach((action) => {
          const actionFramesPerDir = action.Frame + action.Skip;

          // For each direction
          for (let dirIndex = 0; dirIndex < action.Dir; dirIndex++) {
            // For each frame (only real frames, not skip frames)
            for (
              let frameOffset = 0;
              frameOffset < action.Frame;
              frameOffset++
            ) {
              const originalFrameIndex =
                action.Start + dirIndex * actionFramesPerDir + frameOffset;

              // Find position of this frame in our current array
              const filteredIndex =
                includedFrameIndices.indexOf(originalFrameIndex);
              if (
                filteredIndex !== -1 &&
                filteredIndex < props.value.images.length
              ) {
                result[filteredIndex] = {
                  act: action.Output as ActOutput,
                  dir: dirIndex as ActDir,
                };
              }
            }
          }
        });

        // Log a summary of what we mapped
        const mappedFrames = result.filter((item) => item.act !== null).length;
        console.log(
          `Mapped ${mappedFrames} frames out of ${props.value.images.length} total images`
        );
      } catch (error) {
        console.error("Error processing frame metadata:", error);
      }

      return result;
    });

    // A simpler approach that relies on frame order being preserved after filtering
    const simpleFrameMetadata = computed(() => {
      if (!props.value.config) return [];

      const config = props.value.config as ResourceConfig;
      const result: Array<{ act: ActOutput | null; dir: ActDir | null }> = [];

      // Initialize all frames with null values
      for (let i = 0; i < props.value.images.length; i++) {
        result.push({ act: null, dir: null });
      }

      try {
        // Count how many non-skip frames we have in the config
        let totalConfigFrames = 0;
        config.Actions.forEach((action) => {
          totalConfigFrames += action.Frame * action.Dir;
        });

        // If our image count matches the expected non-skip frame count,
        // we can assume all skip frames have been removed
        if (props.value.images.length === totalConfigFrames) {
          let currentIndex = 0;

          // Assign metadata directly in the order of the config
          config.Actions.forEach((action) => {
            for (let dirIndex = 0; dirIndex < action.Dir; dirIndex++) {
              for (
                let frameOffset = 0;
                frameOffset < action.Frame;
                frameOffset++
              ) {
                if (currentIndex < props.value.images.length) {
                  result[currentIndex] = {
                    act: action.Output as ActOutput,
                    dir: dirIndex as ActDir,
                  };
                  currentIndex++;
                }
              }
            }
          });

          console.log(`Simple mapping applied: ${currentIndex} frames mapped`);
        } else {
          console.warn(
            `Image count (${props.value.images.length}) doesn't match expected frame count (${totalConfigFrames})`
          );
        }
      } catch (error) {
        console.error("Error in simple frame metadata mapping:", error);
      }

      return result;
    });

    // Use the simple metadata if it seems valid, otherwise fall back to the more complex approach
    const effectiveMetadata = computed(() => {
      const simpleMapped = simpleFrameMetadata.value.filter(
        (m) => m.act !== null
      ).length;
      if (simpleMapped === props.value.images.length) {
        return simpleFrameMetadata.value;
      }
      return frameMetadata.value;
    });

    // Check if a frame should be displayed based on filter
    const shouldDisplayFrame = (index: number): boolean => {
      // If both filter arrays are empty, show all frames
      if (props.filter.acts.length === 0 && props.filter.dirs.length === 0) {
        return true;
      }

      const metadata = effectiveMetadata.value[index];

      // If this frame doesn't have metadata, we can't filter it
      if (!metadata || metadata.act === null || metadata.dir === null) {
        return false;
      }

      // Check if the action is in the filter (or if acts filter is empty)
      const actMatch =
        props.filter.acts.length === 0 ||
        props.filter.acts.some((act) => act === metadata.act);

      // Check if the direction is in the filter (or if dirs filter is empty)
      const dirMatch =
        props.filter.dirs.length === 0 ||
        props.filter.dirs.some((dir) => Number(dir) === Number(metadata.dir));

      // Both filters must match
      return actMatch && dirMatch;
    };

    // Debug function to show what's happening with the filtering
    const debugFrameFiltering = () => {
      console.group("Frame Filter Debug");
      console.log("Filter settings:", {
        acts: props.filter.acts.map((a) => String(a)),
        dirs: props.filter.dirs.map((d) => Number(d)),
      });

      const frameAnalysis = [];
      for (let i = 0; i < props.value.images.length; i++) {
        const metadata = effectiveMetadata.value[i];
        const isShown = shouldDisplayFrame(i);

        frameAnalysis.push({
          index: i,
          act: metadata?.act || "null",
          dir: metadata?.dir !== undefined ? Number(metadata.dir) : "null",
          isShown,
        });
      }

      console.table(frameAnalysis);
      console.groupEnd();
    };

    // Find the next valid frame based on filter
    const findNextValidFrame = (currentIdx: number): number => {
      // Safety check for empty images array
      if (props.value.images.length === 0) return 0;

      // Check if there are any valid frames at all
      let hasValidFrames = false;
      for (let i = 0; i < props.value.images.length; i++) {
        if (shouldDisplayFrame(i)) {
          hasValidFrames = true;
          break;
        }
      }

      if (!hasValidFrames) {
        console.warn("No valid frames found with current filter!");
        return currentIdx;
      }

      // Find next valid frame
      let nextIdx = (currentIdx + 1) % props.value.images.length;
      let loopSafety = 0;

      while (!shouldDisplayFrame(nextIdx) && nextIdx !== currentIdx) {
        nextIdx = (nextIdx + 1) % props.value.images.length;

        // Safety break to prevent infinite loops
        loopSafety++;
        if (loopSafety > props.value.images.length) {
          console.error("Infinite loop detected in findNextValidFrame!");
          return currentIdx;
        }
      }

      return nextIdx;
    };

    // Find the first valid frame based on filter
    const findFirstValidFrame = (): number => {
      for (let i = 0; i < props.value.images.length; i++) {
        if (shouldDisplayFrame(i)) {
          return i;
        }
      }
      // If no valid frames, return 0
      return 0;
    };

    // Update the frame update logic to use our filtering function
    const updateFrame = async () => {
      currentIndex.value = findNextValidFrame(currentIndex.value);
      resourceFrame.value = props.value.images[currentIndex.value];
    };

    const animate = (timestamp: number) => {
      if (!isAnimating.value) return;

      if (!lastFrameTime.value) {
        lastFrameTime.value = timestamp;
      }

      const elapsed = timestamp - lastFrameTime.value;

      if (elapsed >= props.speed) {
        lastFrameTime.value = timestamp;
        updateFrame();
      }

      animationFrameId.value = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (props.value.images.length <= 1 || isAnimating.value) return;

      isAnimating.value = true;
      lastFrameTime.value = 0;
      animationFrameId.value = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      isAnimating.value = false;
      if (animationFrameId.value !== null) {
        cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = null;
      }
    };

    // 根据status属性控制动画
    watch(
      () => props.status,
      (newStatus) => {
        if (newStatus === FrameStatus.Playing) {
          startAnimation();
        } else {
          stopAnimation();
          // Reset to the first valid frame when stopping
          const firstValidIdx = findFirstValidFrame();
          currentIndex.value = firstValidIdx;
          resourceFrame.value = props.value.images[firstValidIdx];
        }
      },
      { immediate: true }
    );

    // 监听speed变化
    watch(
      () => props.speed,
      () => {
        if (isAnimating.value) {
          // 如果正在播放中，则重新启动动画以应用新速度
          stopAnimation();
          startAnimation();
        }
      }
    );

    // Watch for filter changes
    watch(
      [() => props.filter.acts, () => props.filter.dirs],
      (newValue, oldValue) => {
        console.log("Filter changed:", {
          acts: props.filter.acts,
          dirs: props.filter.dirs,
        });

        // Log the string values to make sure we're comparing correctly
        console.log(
          "Acts as strings:",
          props.filter.acts.map((a) => String(a))
        );
        console.log(
          "Dirs as numbers:",
          props.filter.dirs.map((d) => Number(d))
        );

        // Reset animation when filter changes
        if (isAnimating.value) {
          stopAnimation();
        }

        if (props.value.images.length > 0) {
          // Find the first valid frame with the new filter
          const firstValidIdx = findFirstValidFrame();
          console.log(
            "First valid frame index with new filter:",
            firstValidIdx
          );
          currentIndex.value = firstValidIdx;
          resourceFrame.value = props.value.images[firstValidIdx];

          // Restart animation if we were playing
          if (props.status === FrameStatus.Playing) {
            startAnimation();
          }
        }

        // Call debug function to see which frames are being filtered
        setTimeout(debugFrameFiltering, 100);
      },
      { deep: true }
    );

    onBeforeMount(() => {
      try {
        // Log frame metadata on mount to help debug
        console.log("Layer metadata on mount:", {
          name: props.value.name,
          imageCount: props.value.images.length,
          config: props.value.config,
        });

        // Start with the first valid frame
        const firstValidIdx = findFirstValidFrame();
        console.log("First valid frame on mount:", firstValidIdx);
        resourceFrame.value = props.value.images[firstValidIdx];
        currentIndex.value = firstValidIdx;
        status.value = Status.Success;
      } catch (error) {
        console.error("Error in onBeforeMount:", error);
        status.value = Status.Error;
      }
    });

    onMounted(() => {
      if (props.status === FrameStatus.Playing) {
        startAnimation();
      }
    });

    onUnmounted(() => {
      stopAnimation();
    });

    return () => (
      <div
        class="absolute select-none"
        style={{
          left: `${props.value.x}px`,
          top: `${props.value.y}px`,
          width: `${resourceFrame.value?.size[0]}px`,
          height: `${resourceFrame.value?.size[1]}px`,
          transform: `translate(${resourceFrame.value?.offset[0]}px, ${resourceFrame.value?.offset[1]}px)`,
        }}
      >
        {status.value === Status.Loading && (
          <div class="absolute inset-0 flex items-center justify-center bg-gray-200">
            <svg
              class="animate-spin h-8 w-8 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8A8.009 8.009 8.009 0 0 1 12 20z"
              />
            </svg>
          </div>
        )}
        {status.value === Status.Success && (
          <img src={resourceFrame.value?.image.src} />
        )}
      </div>
    );
  },
});
