class EventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(...args));
  }
}

// Type definitions
interface GIFOptions {
  workerScript?: string;
  workers?: number;
  repeat?: number;
  background?: string;
  quality?: number;
  width?: number | null;
  height?: number | null;
  transparent?: string | null;
  debug?: boolean;
  dither?: boolean | string;
  globalPalette?: boolean | Uint8Array;
}

interface FrameOptions {
  delay?: number;
  copy?: boolean;
  transparent?: string | null;
}

interface Frame {
  data?: Uint8ClampedArray<ArrayBufferLike>;
  context?: CanvasRenderingContext2D | WebGLRenderingContext;
  image?: HTMLImageElement;
  transparent?: string | null;
  delay: number;
  copy: boolean;
}

interface Task {
  index: number;
  last: boolean;
  delay: number;
  transparent: string | null;
  width: number;
  height: number;
  quality: number;
  dither: boolean | string;
  globalPalette: boolean | Uint8Array;
  repeat: number;
  data: Uint8ClampedArray<ArrayBufferLike>;
}

interface ImagePart {
  data: Uint8Array[];
  cursor: number;
  pageSize: number;
  index: number;
  globalPalette?: Uint8Array;
}

export class GIF extends EventEmitter {
  private running: boolean;
  private options: GIFOptions;
  private frames: Frame[];
  private freeWorkers: Worker[];
  private activeWorkers: Worker[];
  private nextFrame: number = 0;
  private finishedFrames: number = 0;
  private imageParts: (ImagePart | null)[] = [];
  private _canvas?: HTMLCanvasElement;

  private static defaults: GIFOptions = {
    workerScript: "gif.worker.js",
    workers: 2,
    repeat: 0,
    background: "#fff",
    quality: 10,
    width: null,
    height: null,
    transparent: null,
    debug: false,
    dither: false,
  };

  private static frameDefaults: Required<Pick<FrameOptions, "delay" | "copy">> =
    {
      delay: 500,
      copy: false,
    };

  constructor(options?: GIFOptions) {
    super();
    this.running = false;
    this.options = {};
    this.frames = [];
    this.freeWorkers = [];
    this.activeWorkers = [];
    this.options = { ...GIF.defaults, ...options };
  }

  public addFrame(
    image:
      | HTMLImageElement
      | ImageData
      | CanvasRenderingContext2D
      | WebGLRenderingContext,
    options: FrameOptions = {}
  ): number {
    const frame: Frame = {
      transparent: this.options.transparent,
      delay: options.delay || GIF.frameDefaults.delay,
      copy: options.copy || GIF.frameDefaults.copy,
    };

    if (image instanceof ImageData) {
      frame.data = image.data;
    } else if (
      image instanceof CanvasRenderingContext2D ||
      image instanceof WebGLRenderingContext
    ) {
      if (options.copy) {
        frame.data = this.getContextData(image);
      } else {
        frame.context = image;
      }
    } else if ("childNodes" in image) {
      if (options.copy) {
        frame.data = this.getImageData(image as HTMLImageElement);
      } else {
        frame.image = image as HTMLImageElement;
      }
    } else {
      throw new Error("Invalid image");
    }

    return this.frames.push(frame);
  }

  public render(): void {
    if (this.running) {
      throw new Error("Already running");
    }

    if (this.options.width == null || this.options.height == null) {
      throw new Error("Width and height must be set prior to rendering");
    }

    this.running = true;
    this.nextFrame = 0;
    this.finishedFrames = 0;

    this.imageParts = Array(this.frames.length).fill(null);
    const numWorkers = this.spawnWorkers();

    if (this.options.globalPalette === true) {
      this.renderNextFrame();
    } else {
      for (let i = 0; i < numWorkers; i++) {
        this.renderNextFrame();
      }
    }

    this.emit("start");
    this.emit("progress", 0);
  }

  public abort(): void {
    let worker: Worker | undefined;
    while ((worker = this.activeWorkers.shift())) {
      this.log("killing active worker");
      worker.terminate();
    }
    this.running = false;
    this.emit("abort");
  }

  private spawnWorkers(): number {
    const numWorkers = Math.min(this.options.workers || 2, this.frames.length);

    for (let i = this.freeWorkers.length; i < numWorkers; i++) {
      this.log(`spawning worker ${i}`);
      const worker = new Worker(this.options.workerScript || "");

      worker.onmessage = (event) => {
        this.activeWorkers.splice(this.activeWorkers.indexOf(worker), 1);
        this.freeWorkers.push(worker);
        this.frameFinished(event.data);
      };

      this.freeWorkers.push(worker);
    }

    return numWorkers;
  }

  private frameFinished(frame: ImagePart): void {
    this.log(
      `frame ${frame.index} finished - ${this.activeWorkers.length} active`
    );
    this.finishedFrames++;
    this.emit("progress", this.finishedFrames / this.frames.length);
    this.imageParts[frame.index] = frame;

    if (this.options.globalPalette === true) {
      this.options.globalPalette = frame.globalPalette;
      this.log("global palette analyzed");
      if (this.frames.length > 2) {
        for (let i = 1; i < this.freeWorkers.length; i++) {
          this.renderNextFrame();
        }
      }
    }

    if (this.imageParts.indexOf(null) >= 0) {
      this.renderNextFrame();
    } else {
      this.finishRendering();
    }
  }

  private finishRendering(): void {
    let len = 0;
    for (const frame of this.imageParts) {
      if (frame) {
        len += (frame.data.length - 1) * frame.pageSize + frame.cursor;
      }
    }

    const frame = this.imageParts[this.imageParts.length - 1];
    if (frame) {
      len += frame.pageSize - frame.cursor;
    }

    this.log(`rendering finished - filesize ${Math.round(len / 1e3)}kb`);

    const data = new Uint8Array(len);
    let offset = 0;

    for (const frame of this.imageParts) {
      if (!frame) continue;

      for (let i = 0; i < frame.data.length; i++) {
        const page = frame.data[i];
        data.set(page, offset);
        if (i === frame.data.length - 1) {
          offset += frame.cursor;
        } else {
          offset += frame.pageSize;
        }
      }
    }

    const image = new Blob([data], { type: "image/gif" });
    this.emit("finished", image, data);
  }

  private renderNextFrame(): void {
    if (this.freeWorkers.length === 0) {
      throw new Error("No free workers");
    }

    if (this.nextFrame >= this.frames.length) {
      return;
    }

    const frame = this.frames[this.nextFrame++];
    const worker = this.freeWorkers.shift()!;
    const task = this.getTask(frame);

    this.log(`starting frame ${task.index + 1} of ${this.frames.length}`);
    this.activeWorkers.push(worker);
    worker.postMessage(task);
  }

  private getContextData(
    ctx: CanvasRenderingContext2D | WebGLRenderingContext
  ) {
    return (ctx as CanvasRenderingContext2D).getImageData(
      0,
      0,
      this.options.width || 0,
      this.options.height || 0
    ).data;
  }

  private getImageData(image: HTMLImageElement) {
    if (!this._canvas) {
      this._canvas = document.createElement("canvas");
      this._canvas.width = this.options.width || 0;
      this._canvas.height = this.options.height || 0;
    }

    const ctx = this._canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = this.options.background || "#fff";
    ctx.fillRect(0, 0, this.options.width || 0, this.options.height || 0);
    ctx.drawImage(image, 0, 0);

    return this.getContextData(ctx);
  }

  private getTask(frame: Frame): Task {
    const index = this.frames.indexOf(frame);
    const task: Task = {
      index: index,
      last: index === this.frames.length - 1,
      delay: frame.delay,
      transparent: frame.transparent || null,
      width: this.options.width || 0,
      height: this.options.height || 0,
      quality: this.options.quality || 10,
      dither: this.options.dither || false,
      globalPalette: this.options.globalPalette || false,
      repeat: this.options.repeat || 0,
      data: new Uint8ClampedArray(0),
    };

    if (frame.data != null) {
      task.data = frame.data;
    } else if (frame.context != null) {
      task.data = this.getContextData(frame.context);
    } else if (frame.image != null) {
      task.data = this.getImageData(frame.image);
    } else {
      throw new Error("Invalid frame");
    }

    return task;
  }

  private log(...args: any[]): void {
    if (!this.options.debug) return;
    console.log(...args);
  }
}

export default GIF;
