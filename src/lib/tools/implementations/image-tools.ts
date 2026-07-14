import type { UtilityToolField } from "@/types/utility-tools";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export async function loadImageToCanvas(
  file: File
): Promise<{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve({ canvas, ctx, img });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image. The file may be corrupted or in an unsupported format."));
    };

    img.src = url;
  });
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Failed to export canvas as ${mimeType}`));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality !== undefined ? quality / 100 : undefined
    );
  });
}

// ---------------------------------------------------------------------------
// Type for image tool exports
// ---------------------------------------------------------------------------

export type ImageToolExport = {
  processFn: (file: File, options: Record<string, string>) => Promise<Blob>;
  outputFormat: string;
  fields?: UtilityToolField[];
};

// ---------------------------------------------------------------------------
// 1. Image Compressor
// ---------------------------------------------------------------------------

export const imageCompressor: ImageToolExport = {
  outputFormat: "image/jpeg",
  fields: [
    {
      key: "quality",
      label: "Quality (1–100)",
      type: "number",
      placeholder: "80",
      defaultValue: "80",
      required: true,
    },
    {
      key: "format",
      label: "Output Format",
      type: "select",
      defaultValue: "auto",
      options: [
        { value: "auto", label: "Same as input" },
        { value: "image/jpeg", label: "JPEG" },
        { value: "image/png", label: "PNG" },
        { value: "image/webp", label: "WebP" },
      ],
    },
  ],
  async processFn(file, options) {
    const quality = Math.min(100, Math.max(1, parseInt(options.quality || "80", 10)));
    const { canvas } = await loadImageToCanvas(file);
    let mime = options.format || "auto";
    if (mime === "auto") {
      if (file.type === "image/png") mime = "image/png";
      else if (file.type === "image/webp") mime = "image/webp";
      else mime = "image/jpeg";
    }
    return canvasToBlob(canvas, mime, quality);
  },
};

// ---------------------------------------------------------------------------
// 2. Image Resizer
// ---------------------------------------------------------------------------

export const imageResizer: ImageToolExport = {
  outputFormat: "image/png",
  fields: [
    {
      key: "width",
      label: "Width (px)",
      type: "number",
      placeholder: "e.g. 800",
    },
    {
      key: "height",
      label: "Height (px)",
      type: "number",
      placeholder: "e.g. 600",
    },
    {
      key: "maintainAspectRatio",
      label: "Maintain aspect ratio",
      type: "checkbox",
      defaultValue: "true",
    },
  ],
  async processFn(file, options) {
    const { img } = await loadImageToCanvas(file);
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    let newW = options.width ? parseInt(options.width, 10) : 0;
    let newH = options.height ? parseInt(options.height, 10) : 0;
    const keepRatio = options.maintainAspectRatio !== "false";

    if (!newW && !newH) {
      throw new Error("Please specify at least a width or height.");
    }

    if (keepRatio) {
      if (newW && !newH) {
        newH = Math.round((newW / origW) * origH);
      } else if (!newW && newH) {
        newW = Math.round((newH / origH) * origW);
      } else {
        const scale = Math.min(newW / origW, newH / origH);
        newW = Math.round(origW * scale);
        newH = Math.round(origH * scale);
      }
    } else {
      if (!newW) newW = origW;
      if (!newH) newH = origH;
    }

    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");
    ctx.drawImage(img, 0, 0, newW, newH);

    return canvasToBlob(canvas, "image/png");
  },
};

// ---------------------------------------------------------------------------
// 3. Image Cropper
// ---------------------------------------------------------------------------

export const imageCropper: ImageToolExport = {
  outputFormat: "image/png",
  fields: [
    { key: "x", label: "X offset (px or %)", type: "text", placeholder: "0", defaultValue: "0" },
    { key: "y", label: "Y offset (px or %)", type: "text", placeholder: "0", defaultValue: "0" },
    { key: "width", label: "Crop width (px or %)", type: "text", placeholder: "e.g. 400 or 50%", required: true },
    { key: "height", label: "Crop height (px or %)", type: "text", placeholder: "e.g. 300 or 50%", required: true },
  ],
  async processFn(file, options) {
    const { img } = await loadImageToCanvas(file);
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    function parseVal(v: string, ref: number): number {
      const trimmed = v.trim();
      if (trimmed.endsWith("%")) {
        return Math.round((parseFloat(trimmed) / 100) * ref);
      }
      return parseInt(trimmed, 10);
    }

    const cx = parseVal(options.x || "0", origW);
    const cy = parseVal(options.y || "0", origH);
    const cw = parseVal(options.width || "0", origW);
    const ch = parseVal(options.height || "0", origH);

    if (cw <= 0 || ch <= 0) throw new Error("Crop width and height must be positive values.");
    if (cx < 0 || cy < 0) throw new Error("Crop offsets cannot be negative.");
    if (cx + cw > origW || cy + ch > origH) {
      throw new Error("Crop area extends beyond image boundaries.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");
    ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);

    return canvasToBlob(canvas, "image/png");
  },
};

// ---------------------------------------------------------------------------
// 4. JPG to WebP
// ---------------------------------------------------------------------------

export const jpgToWebp: ImageToolExport = {
  outputFormat: "image/webp",
  fields: [
    {
      key: "quality",
      label: "Quality (1–100)",
      type: "number",
      placeholder: "80",
      defaultValue: "80",
    },
  ],
  async processFn(file, options) {
    if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
      throw new Error("Please upload a JPEG/JPG image.");
    }
    const quality = Math.min(100, Math.max(1, parseInt(options.quality || "80", 10)));
    const { canvas } = await loadImageToCanvas(file);
    return canvasToBlob(canvas, "image/webp", quality);
  },
};

// ---------------------------------------------------------------------------
// 5. PNG to WebP
// ---------------------------------------------------------------------------

export const pngToWebp: ImageToolExport = {
  outputFormat: "image/webp",
  fields: [
    {
      key: "quality",
      label: "Quality (1–100)",
      type: "number",
      placeholder: "80",
      defaultValue: "80",
    },
  ],
  async processFn(file, options) {
    if (!file.type.includes("png")) {
      throw new Error("Please upload a PNG image.");
    }
    const quality = Math.min(100, Math.max(1, parseInt(options.quality || "80", 10)));
    const { canvas } = await loadImageToCanvas(file);
    return canvasToBlob(canvas, "image/webp", quality);
  },
};

// ---------------------------------------------------------------------------
// 6. WebP to PNG
// ---------------------------------------------------------------------------

export const webpToPng: ImageToolExport = {
  outputFormat: "image/png",
  async processFn(file) {
    if (!file.type.includes("webp")) {
      throw new Error("Please upload a WebP image.");
    }
    const { canvas } = await loadImageToCanvas(file);
    return canvasToBlob(canvas, "image/png");
  },
};

// ---------------------------------------------------------------------------
// 6b. WebP to JPG
// ---------------------------------------------------------------------------

export const webpToJpg: ImageToolExport = {
  outputFormat: "image/jpeg",
  fields: [
    {
      key: "quality",
      label: "Quality (1–100)",
      type: "number",
      placeholder: "90",
      defaultValue: "90",
    },
    {
      key: "bgColor",
      label: "Background color (for transparency)",
      type: "color",
      defaultValue: "#ffffff",
    },
  ],
  async processFn(file, options) {
    if (!file.type.includes("webp")) {
      throw new Error("Please upload a WebP image.");
    }
    const quality = Math.min(100, Math.max(1, parseInt(options.quality || "90", 10)));
    const bgColor = options.bgColor || "#ffffff";

    const { img } = await loadImageToCanvas(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return canvasToBlob(canvas, "image/jpeg", quality);
  },
};

// ---------------------------------------------------------------------------
// 7. JPG to PNG
// ---------------------------------------------------------------------------

export const jpgToPng: ImageToolExport = {
  outputFormat: "image/png",
  async processFn(file) {
    if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
      throw new Error("Please upload a JPEG/JPG image.");
    }
    const { canvas } = await loadImageToCanvas(file);
    return canvasToBlob(canvas, "image/png");
  },
};

// ---------------------------------------------------------------------------
// 8. PNG to JPG
// ---------------------------------------------------------------------------

export const pngToJpg: ImageToolExport = {
  outputFormat: "image/jpeg",
  fields: [
    {
      key: "quality",
      label: "Quality (1–100)",
      type: "number",
      placeholder: "90",
      defaultValue: "90",
    },
    {
      key: "bgColor",
      label: "Background color",
      type: "color",
      defaultValue: "#ffffff",
    },
  ],
  async processFn(file, options) {
    if (!file.type.includes("png")) {
      throw new Error("Please upload a PNG image.");
    }
    const quality = Math.min(100, Math.max(1, parseInt(options.quality || "90", 10)));
    const bgColor = options.bgColor || "#ffffff";

    const { img } = await loadImageToCanvas(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return canvasToBlob(canvas, "image/jpeg", quality);
  },
};

// ---------------------------------------------------------------------------
// 9. Image Rotator
// ---------------------------------------------------------------------------

export const imageRotator: ImageToolExport = {
  outputFormat: "image/png",
  fields: [
    {
      key: "angle",
      label: "Rotation angle",
      type: "select",
      defaultValue: "90",
      options: [
        { value: "90", label: "90°" },
        { value: "180", label: "180°" },
        { value: "270", label: "270°" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      key: "customAngle",
      label: "Custom angle (degrees)",
      type: "number",
      placeholder: "e.g. 45",
    },
  ],
  async processFn(file, options) {
    const { img } = await loadImageToCanvas(file);
    const angle = options.angle === "custom"
      ? parseFloat(options.customAngle || "0")
      : parseFloat(options.angle || "90");

    const radians = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const newW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
    const newH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

    const canvas = document.createElement("canvas");
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");

    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    return canvasToBlob(canvas, "image/png");
  },
};

// ---------------------------------------------------------------------------
// 10. Image Flip
// ---------------------------------------------------------------------------

export const imageFlip: ImageToolExport = {
  outputFormat: "image/png",
  fields: [
    {
      key: "direction",
      label: "Flip direction",
      type: "select",
      defaultValue: "horizontal",
      options: [
        { value: "horizontal", label: "Horizontal" },
        { value: "vertical", label: "Vertical" },
        { value: "both", label: "Both" },
      ],
    },
  ],
  async processFn(file, options) {
    const { img } = await loadImageToCanvas(file);
    const direction = options.direction || "horizontal";

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas 2D context");

    const scaleX = direction === "horizontal" || direction === "both" ? -1 : 1;
    const scaleY = direction === "vertical" || direction === "both" ? -1 : 1;

    ctx.translate(
      scaleX === -1 ? canvas.width : 0,
      scaleY === -1 ? canvas.height : 0
    );
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(img, 0, 0);

    return canvasToBlob(canvas, "image/png");
  },
};
