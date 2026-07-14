// ---------------------------------------------------------------------------
// Dev utilities tool implementations
// ---------------------------------------------------------------------------

type TransformFn = (input: string, options?: Record<string, string>) => string;
type AsyncTransformFn = (input: string, options?: Record<string, string>) => Promise<string>;
type AnalyzeResult = { label: string; value: string | number }[];
type AnalyzeFn = (text: string) => AnalyzeResult;

// ── 1. html-minifier ───────────────────────────────────────────────────────

export const htmlMinifier: { transformFn: TransformFn } = {
  transformFn(input) {
    return input
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .trim();
  },
};

// ── 2. css-minifier ────────────────────────────────────────────────────────

export const cssMinifier: { transformFn: TransformFn } = {
  transformFn(input) {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>~+])\s*/g, "$1")
      .replace(/;}/g, "}")
      .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, "#$1$2$3")
      .trim();
  },
};

// ── 3. javascript-minifier ─────────────────────────────────────────────────

export const javascriptMinifier: { transformFn: TransformFn } = {
  transformFn(input) {
    let result = input
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    result = result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/ {2,}/g, " ");

    return result.trim();
  },
};

// ── 4. json-formatter ──────────────────────────────────────────────────────

export const jsonFormatter: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    try {
      const parsed = JSON.parse(input);
      const indent = options.indent === "tabs" ? "\t" : Number(options.indent) || 2;
      return JSON.stringify(parsed, null, indent);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `⚠ Invalid JSON: ${message}`;
    }
  },
};

// ── 5. md5-generator ───────────────────────────────────────────────────────
// Compact public-domain MD5 implementation (RFC 1321)

function md5(input: string): string {
  function toUTF8(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c < 0x10000) {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      } else {
        bytes.push(
          0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f),
          0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f),
        );
      }
    }
    return bytes;
  }

  function add32(a: number, b: number) { return (a + b) & 0xffffffff; }
  function rotl(v: number, n: number) { return (v << n) | (v >>> (32 - n)); }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32(rotl(a, s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const bytes = toUTF8(input);
  const len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = len * 8;
  bytes.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff);
  bytes.push(0, 0, 0, 0);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const w: number[] = [];
    for (let j = 0; j < 16; j++) {
      const off = i + j * 4;
      w[j] = bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24);
    }

    let a = a0, b = b0, c = c0, d = d0;

    a = ff(a, b, c, d, w[0], 7, 0xd76aa478);  d = ff(d, a, b, c, w[1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, w[2], 17, 0x242070db); b = ff(b, c, d, a, w[3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, w[4], 7, 0xf57c0faf);  d = ff(d, a, b, c, w[5], 12, 0x4787c62a);
    c = ff(c, d, a, b, w[6], 17, 0xa8304613); b = ff(b, c, d, a, w[7], 22, 0xfd469501);
    a = ff(a, b, c, d, w[8], 7, 0x698098d8);  d = ff(d, a, b, c, w[9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, w[10], 17, 0xffff5bb1); b = ff(b, c, d, a, w[11], 22, 0x895cd7be);
    a = ff(a, b, c, d, w[12], 7, 0x6b901122); d = ff(d, a, b, c, w[13], 12, 0xfd987193);
    c = ff(c, d, a, b, w[14], 17, 0xa679438e); b = ff(b, c, d, a, w[15], 22, 0x49b40821);

    a = gg(a, b, c, d, w[1], 5, 0xf61e2562);  d = gg(d, a, b, c, w[6], 9, 0xc040b340);
    c = gg(c, d, a, b, w[11], 14, 0x265e5a51); b = gg(b, c, d, a, w[0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, w[5], 5, 0xd62f105d);  d = gg(d, a, b, c, w[10], 9, 0x02441453);
    c = gg(c, d, a, b, w[15], 14, 0xd8a1e681); b = gg(b, c, d, a, w[4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, w[9], 5, 0x21e1cde6);  d = gg(d, a, b, c, w[14], 9, 0xc33707d6);
    c = gg(c, d, a, b, w[3], 14, 0xf4d50d87);  b = gg(b, c, d, a, w[8], 20, 0x455a14ed);
    a = gg(a, b, c, d, w[13], 5, 0xa9e3e905); d = gg(d, a, b, c, w[2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, w[7], 14, 0x676f02d9);  b = gg(b, c, d, a, w[12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, w[5], 4, 0xfffa3942);  d = hh(d, a, b, c, w[8], 11, 0x8771f681);
    c = hh(c, d, a, b, w[11], 16, 0x6d9d6122); b = hh(b, c, d, a, w[14], 23, 0xfde5380c);
    a = hh(a, b, c, d, w[1], 4, 0xa4beea44);  d = hh(d, a, b, c, w[4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, w[7], 16, 0xf6bb4b60);  b = hh(b, c, d, a, w[10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, w[13], 4, 0x289b7ec6); d = hh(d, a, b, c, w[0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, w[3], 16, 0xd4ef3085);  b = hh(b, c, d, a, w[6], 23, 0x04881d05);
    a = hh(a, b, c, d, w[9], 4, 0xd9d4d039);  d = hh(d, a, b, c, w[12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, w[15], 16, 0x1fa27cf8); b = hh(b, c, d, a, w[2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, w[0], 6, 0xf4292244);  d = ii(d, a, b, c, w[7], 10, 0x432aff97);
    c = ii(c, d, a, b, w[14], 15, 0xab9423a7); b = ii(b, c, d, a, w[5], 21, 0xfc93a039);
    a = ii(a, b, c, d, w[12], 6, 0x655b59c3); d = ii(d, a, b, c, w[3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, w[10], 15, 0xffeff47d); b = ii(b, c, d, a, w[1], 21, 0x85845dd1);
    a = ii(a, b, c, d, w[8], 6, 0x6fa87e4f);  d = ii(d, a, b, c, w[15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, w[6], 15, 0xa3014314);  b = ii(b, c, d, a, w[13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, w[4], 6, 0xf7537e82);  d = ii(d, a, b, c, w[11], 10, 0xbd3af235);
    c = ii(c, d, a, b, w[2], 15, 0x2ad7d2bb);  b = ii(b, c, d, a, w[9], 21, 0xeb86d391);

    a0 = add32(a0, a); b0 = add32(b0, b); c0 = add32(c0, c); d0 = add32(d0, d);
  }

  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, i) =>
      ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0"),
    ).join("");

  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

export const md5Generator: { transformFn: TransformFn } = {
  transformFn(input) {
    return md5(input);
  },
};

// ── 6. sha256-generator ────────────────────────────────────────────────────

export const sha256Generator: { transformFn: TransformFn } = {
  transformFn(input) {
    if (!input.trim()) return "";
    // Synchronous SHA-256 — lightweight JS implementation
    function rightRotate(v: number, n: number) { return (v >>> n) | (v << (32 - n)); }
    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
    ];
    const bytes = new TextEncoder().encode(input);
    const bitLen = bytes.length * 8;
    const padded: number[] = Array.from(bytes);
    padded.push(0x80);
    while ((padded.length % 64) !== 56) padded.push(0);
    for (let i = 56; i >= 0; i -= 8) padded.push((bitLen / Math.pow(2, i)) & 0xff);
    let [h0,h1,h2,h3,h4,h5,h6,h7] = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    for (let off = 0; off < padded.length; off += 64) {
      const w = new Array<number>(64);
      for (let i = 0; i < 16; i++) w[i] = (padded[off+i*4]<<24)|(padded[off+i*4+1]<<16)|(padded[off+i*4+2]<<8)|padded[off+i*4+3];
      for (let i = 16; i < 64; i++) {
        const s0 = rightRotate(w[i-15],7) ^ rightRotate(w[i-15],18) ^ (w[i-15]>>>3);
        const s1 = rightRotate(w[i-2],17) ^ rightRotate(w[i-2],19) ^ (w[i-2]>>>2);
        w[i] = (w[i-16]+s0+w[i-7]+s1) | 0;
      }
      let [a,b,c,d,e,f,g,h] = [h0,h1,h2,h3,h4,h5,h6,h7];
      for (let i = 0; i < 64; i++) {
        const S1 = rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25);
        const ch = (e&f) ^ (~e&g);
        const t1 = (h+S1+ch+K[i]+w[i]) | 0;
        const S0 = rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22);
        const maj = (a&b) ^ (a&c) ^ (b&c);
        const t2 = (S0+maj) | 0;
        h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
      }
      h0=(h0+a)|0; h1=(h1+b)|0; h2=(h2+c)|0; h3=(h3+d)|0; h4=(h4+e)|0; h5=(h5+f)|0; h6=(h6+g)|0; h7=(h7+h)|0;
    }
    return [h0,h1,h2,h3,h4,h5,h6,h7].map(v => (v>>>0).toString(16).padStart(8,"0")).join("");
  },
};

// ── 7. base64-encode ───────────────────────────────────────────────────────

export const base64Encode: { transformFn: TransformFn } = {
  transformFn(input) {
    try {
      return btoa(unescape(encodeURIComponent(input)));
    } catch {
      return "⚠ Could not encode input to Base64";
    }
  },
};

// ── 8. base64-decode ───────────────────────────────────────────────────────

export const base64Decode: { transformFn: TransformFn } = {
  transformFn(input) {
    try {
      return decodeURIComponent(escape(atob(input.trim())));
    } catch {
      return "⚠ Invalid Base64 string";
    }
  },
};

// ── 9. hashtag-generator ───────────────────────────────────────────────────

export const hashtagGenerator: { transformFn: TransformFn } = {
  transformFn(input, options = {}) {
    const items = input
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const style = options.style ?? "title";

    return items
      .map((item) => {
        const cleaned = item.replace(/[^a-zA-Z0-9\s]/g, "");
        if (style === "lowercase") {
          return "#" + cleaned.replace(/\s+/g, "").toLowerCase();
        }
        return (
          "#" +
          cleaned
            .split(/\s+/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
        );
      })
      .join(" ");
  },
};

// ── 10. timestamp-converter ────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const prefix = diff < 0 ? "in " : "";
  const suffix = diff >= 0 ? " ago" : "";

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${prefix}${seconds} second(s)${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${prefix}${minutes} minute(s)${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${prefix}${hours} hour(s)${suffix}`;
  const days = Math.floor(hours / 24);
  return `${prefix}${days} day(s)${suffix}`;
}

export const timestampConverter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const trimmed = text.trim();
    let date: Date;

    const asNum = Number(trimmed);
    if (!isNaN(asNum) && trimmed.length > 0) {
      date = asNum > 1e12 ? new Date(asNum) : new Date(asNum * 1000);
    } else {
      date = new Date(trimmed);
    }

    if (isNaN(date.getTime())) {
      return [{ label: "Error", value: "Could not parse date/timestamp" }];
    }

    return [
      { label: "ISO 8601", value: date.toISOString() },
      { label: "Unix Timestamp (seconds)", value: Math.floor(date.getTime() / 1000) },
      { label: "Unix Timestamp (ms)", value: date.getTime() },
      { label: "Relative Time", value: relativeTime(date) },
      { label: "UTC String", value: date.toUTCString() },
      { label: "Local String", value: date.toLocaleString() },
    ];
  },
};

// ── 11. unix-time-converter ────────────────────────────────────────────────

export const unixTimeConverter: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const trimmed = text.trim();
    const ts = Number(trimmed);
    if (isNaN(ts) || trimmed.length === 0) {
      return [{ label: "Error", value: "Please enter a valid Unix timestamp" }];
    }

    const date = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);

    if (isNaN(date.getTime())) {
      return [{ label: "Error", value: "Invalid timestamp" }];
    }

    return [
      { label: "ISO 8601", value: date.toISOString() },
      { label: "UTC", value: date.toUTCString() },
      { label: "Local Date/Time", value: date.toLocaleString() },
      { label: "Date Only", value: date.toLocaleDateString() },
      { label: "Time Only", value: date.toLocaleTimeString() },
      { label: "Relative", value: relativeTime(date) },
      { label: "Current Unix Time", value: Math.floor(Date.now() / 1000) },
    ];
  },
};

// ── 12. hex-to-rgb ─────────────────────────────────────────────────────────

function hexToRgbValues(hex: string): [number, number, number] | null {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export const hexToRgb: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const rgb = hexToRgbValues(text.trim());
    if (!rgb) return [{ label: "Error", value: "Invalid hex color (use #RRGGBB or #RGB)" }];
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    return [
      { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
      { label: "RGBA", value: `rgba(${r}, ${g}, ${b}, 1)` },
      { label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
      { label: "Color Preview", value: `██████ ${text.trim()}` },
    ];
  },
};

// ── 13. rgb-to-hex ─────────────────────────────────────────────────────────

const CSS_COLORS: Record<string, string> = {
  "255,0,0": "red", "0,128,0": "green", "0,0,255": "blue",
  "255,255,255": "white", "0,0,0": "black", "255,255,0": "yellow",
  "0,255,255": "cyan", "255,0,255": "magenta", "128,128,128": "gray",
  "128,0,0": "maroon", "128,128,0": "olive", "0,128,128": "teal",
  "0,0,128": "navy", "255,165,0": "orange", "255,192,203": "pink",
  "128,0,128": "purple", "165,42,42": "brown", "192,192,192": "silver",
  "240,248,255": "aliceblue", "255,127,80": "coral", "75,0,130": "indigo",
  "255,215,0": "gold", "0,255,0": "lime", "64,224,208": "turquoise",
  "250,128,114": "salmon", "245,245,220": "beige", "255,99,71": "tomato",
};

export const rgbToHex: { analyzeFn: AnalyzeFn } = {
  analyzeFn(text) {
    const nums = text.match(/\d+/g);
    if (!nums || nums.length < 3) {
      return [{ label: "Error", value: "Enter R, G, B values (0-255)" }];
    }
    const [r, g, b] = nums.slice(0, 3).map((n) => Math.min(255, Math.max(0, parseInt(n))));
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    const [h, s, l] = rgbToHsl(r, g, b);
    const colorName = CSS_COLORS[`${r},${g},${b}`] ?? "—";

    return [
      { label: "Hex", value: hex },
      { label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
      { label: "CSS Color Name", value: colorName },
    ];
  },
};

// ── 14. password-generator ─────────────────────────────────────────────────

export const passwordGenerator: { transformFn: TransformFn } = {
  transformFn(_input, options = {}) {
    const length = Math.min(128, Math.max(8, parseInt(options.length ?? "16")));
    const count = Math.min(50, Math.max(1, parseInt(options.count ?? "5")));
    const useUpper = options.uppercase !== "no";
    const useLower = options.lowercase !== "no";
    const useNumbers = options.numbers !== "no";
    const useSymbols = options.symbols !== "no";
    const excludeAmbiguous = options.excludeAmbiguous === "yes";

    let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower = "abcdefghijklmnopqrstuvwxyz";
    let digits = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeAmbiguous) {
      upper = upper.replace(/[OI]/g, "");
      lower = lower.replace(/[l]/g, "");
      digits = digits.replace(/[01]/g, "");
    }

    let charset = "";
    if (useUpper) charset += upper;
    if (useLower) charset += lower;
    if (useNumbers) charset += digits;
    if (useSymbols) charset += symbols;

    if (!charset) charset = lower + digits;

    const passwords: string[] = [];
    for (let i = 0; i < count; i++) {
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      passwords.push(Array.from(arr, (v) => charset[v % charset.length]).join(""));
    }

    return passwords.join("\n");
  },
};

// ── 15. uuid-generator ─────────────────────────────────────────────────────

export const uuidGenerator: { transformFn: TransformFn } = {
  transformFn(_input, options = {}) {
    const count = Math.min(50, Math.max(1, parseInt(options.count ?? "5")));
    const upper = options.uppercase === "yes";
    const noHyphens = options.hyphens === "no";

    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let id: string = crypto.randomUUID();
      if (noHyphens) id = id.replace(/-/g, "");
      if (upper) id = id.toUpperCase();
      uuids.push(id);
    }

    return uuids.join("\n");
  },
};

// ── 16. css-gradient-generator ─────────────────────────────────────────────

export const cssGradientGenerator: { transformFn: TransformFn } = {
  transformFn(_input, options = {}) {
    const type = options.type ?? "linear";
    const angle = options.angle ?? "135";
    const color1 = options.color1 ?? "#667eea";
    const pos1 = options.position1 ?? "0";
    const color2 = options.color2 ?? "#764ba2";
    const pos2 = options.position2 ?? "100";
    const color3 = options.color3;
    const pos3 = options.position3 ?? "50";

    const stops = [`${color1} ${pos1}%`, `${color2} ${pos2}%`];
    if (color3) stops.splice(1, 0, `${color3} ${pos3}%`);

    let gradient: string;
    if (type === "radial") {
      gradient = `radial-gradient(circle, ${stops.join(", ")})`;
    } else {
      gradient = `linear-gradient(${angle}deg, ${stops.join(", ")})`;
    }

    return [
      `background: ${gradient};`,
      "",
      `/* Preview: */`,
      `/* <div style="width:100%;height:120px;border-radius:8px;background:${gradient}"></div> */`,
    ].join("\n");
  },
};

// ── 17. emoji-picker ───────────────────────────────────────────────────────

const EMOJI_DATA: Record<string, string[]> = {
  "Smileys": [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
    "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌",
    "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥵",
  ],
  "Hand Gestures": [
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
    "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍",
    "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🙏",
  ],
  "Animals": [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨",
    "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦅",
    "🦆", "🦉", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐢",
  ],
  "Food": [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒",
    "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🌽", "🌶️",
    "🍕", "🍔", "🍟", "🌭", "🍿", "🧁", "🍩", "🍪", "🎂", "🍰",
  ],
  "Activities": [
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱",
    "🏓", "🏸", "🏒", "🥅", "⛳", "🏹", "🎣", "🤿", "🥊", "🎯",
    "🎮", "🎲", "🧩", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹",
  ],
  "Travel": [
    "🚗", "🚕", "🚙", "🏎️", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚",
    "✈️", "🚀", "🛸", "🚁", "⛵", "🚢", "🏠", "🏢", "🏰", "🗼",
    "🌍", "🌎", "🌏", "🗺️", "🧭", "🏔️", "⛰️", "🌋", "🏖️", "🏝️",
  ],
  "Objects": [
    "⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "💾", "💿", "📷",
    "📹", "🎥", "📞", "☎️", "📺", "📻", "🔋", "🔌", "💡", "🔦",
    "📚", "📖", "📝", "✏️", "📎", "📌", "📐", "📏", "🔑", "🔒",
  ],
  "Symbols": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✨", "⭐",
    "🌟", "💫", "⚡", "🔥", "💥", "☀️", "🌈", "☁️", "❄️", "💧",
    "✅", "❌", "⚠️", "♻️", "💯", "🔴", "🟠", "🟡", "🟢", "🔵",
  ],
};

// ── 18. QR Code Generator ──────────────────────────────────────────────────

type GenFields = { key: string; label: string; type: string; placeholder?: string; defaultValue?: string | number | boolean; options?: { value: string; label: string }[]; required?: boolean; rows?: number }[];
type GenerateFn = (values: Record<string, string>) => string;

export const qrCodeGenerator: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    { key: "data", label: "Text or URL", type: "textarea", placeholder: "Enter text or URL to encode…", required: true, rows: 3 },
    { key: "size", label: "Size (px)", type: "number", placeholder: "200", defaultValue: "200" },
    { key: "color", label: "Foreground Color", type: "color", defaultValue: "#000000" },
    { key: "bg", label: "Background Color", type: "color", defaultValue: "#ffffff" },
  ],
  generate(v) {
    const data = v.data || "";
    const size = parseInt(v.size || "200", 10);
    const fg = v.color || "#000000";
    const bg = v.bg || "#ffffff";
    if (!data.trim()) return "Please enter text or a URL to generate a QR code.";

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=${fg.replace("#", "")}&bgcolor=${bg.replace("#", "")}`;
    return `<div style="text-align:center;padding:20px;">
  <img src="${apiUrl}" alt="QR Code" width="${size}" height="${size}" style="border:1px solid #e0e0e0;border-radius:8px;"/>
  <p style="margin-top:12px;font-size:13px;color:#666;">Right-click the image to save it</p>
  <p style="margin-top:8px;font-size:12px;color:#999;">Direct URL: <a href="${apiUrl}" target="_blank" rel="noopener">${apiUrl.length > 80 ? apiUrl.slice(0, 80) + "…" : apiUrl}</a></p>
</div>`;
  },
};

// ── 19. Barcode Generator ──────────────────────────────────────────────────

export const barcodeGenerator: { fields: GenFields; generate: GenerateFn } = {
  fields: [
    { key: "data", label: "Data / Code", type: "text", placeholder: "e.g. 123456789012", required: true },
    {
      key: "format", label: "Barcode Format", type: "select", defaultValue: "code128",
      options: [
        { value: "code128", label: "Code 128 (general)" },
        { value: "ean13", label: "EAN-13 (retail)" },
        { value: "upc", label: "UPC-A (US retail)" },
        { value: "code39", label: "Code 39" },
        { value: "itf", label: "ITF (Interleaved 2 of 5)" },
      ],
    },
    { key: "width", label: "Bar Width", type: "number", placeholder: "2", defaultValue: "2" },
    { key: "height", label: "Bar Height (px)", type: "number", placeholder: "80", defaultValue: "80" },
  ],
  generate(v) {
    const data = v.data || "";
    const format = v.format || "code128";
    const barW = parseInt(v.width || "2", 10);
    const barH = parseInt(v.height || "80", 10);
    if (!data.trim()) return "Please enter data to generate a barcode.";

    const formatDisplay: Record<string, string> = {
      code128: "Code 128", ean13: "EAN-13", upc: "UPC-A", code39: "Code 39", itf: "ITF",
    };

    const validationErrors: string[] = [];
    if (format === "ean13" && !/^\d{12,13}$/.test(data.trim())) {
      validationErrors.push("EAN-13 requires exactly 12 or 13 digits");
    }
    if (format === "upc" && !/^\d{11,12}$/.test(data.trim())) {
      validationErrors.push("UPC-A requires exactly 11 or 12 digits");
    }
    if (format === "itf" && (!/^\d+$/.test(data.trim()) || data.trim().length % 2 !== 0)) {
      validationErrors.push("ITF requires an even number of digits");
    }

    if (validationErrors.length > 0) {
      return `<div style="color:red;padding:12px;">⚠️ ${validationErrors.join(". ")}</div>`;
    }

    const svgBars = generateCode128SVG(data.trim(), barW, barH);

    return `<div style="text-align:center;padding:20px;background:white;border-radius:8px;">
  <p style="font-size:12px;color:#666;margin-bottom:12px;">Format: ${formatDisplay[format] || format}</p>
  ${svgBars}
  <p style="margin-top:8px;font-size:14px;font-family:monospace;letter-spacing:2px;">${data}</p>
  <p style="margin-top:12px;font-size:12px;color:#999;">Right-click the barcode to copy or save</p>
</div>`;
  },
};

function generateCode128SVG(data: string, barWidth: number, height: number): string {
  const CODE128_START = 104;
  const CODE128_STOP = [2, 3, 3, 1, 1, 1, 2];
  const CODE128_PATTERNS: number[][] = [
    [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
    [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
    [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
    [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
    [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
    [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
    [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
    [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
    [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
    [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
    [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
    [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
    [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
    [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
    [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
    [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
    [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
    [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
    [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
    [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
    [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
    [2,1,1,2,3,2],[2,3,3,1,1,1,2],
  ];

  const codes: number[] = [];
  let checksum = CODE128_START;
  codes.push(CODE128_START);

  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i) - 32;
    codes.push(code);
    checksum += code * (i + 1);
  }
  codes.push(checksum % 103);

  let bars = "";
  let x = 10;
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] * barWidth;
      if (i % 2 === 0) {
        bars += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="black"/>`;
      }
      x += w;
    }
  }
  for (let i = 0; i < CODE128_STOP.length; i++) {
    const w = CODE128_STOP[i] * barWidth;
    if (i % 2 === 0) {
      bars += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="black"/>`;
    }
    x += w;
  }

  const totalWidth = x + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" style="max-width:100%;">${bars}</svg>`;
}

export const emojiPicker: { transformFn: TransformFn } = {
  transformFn(_input, options = {}) {
    const search = (options.search ?? "").toLowerCase();

    const lines: string[] = [];
    for (const [category, emojis] of Object.entries(EMOJI_DATA)) {
      if (search && !category.toLowerCase().includes(search)) continue;
      lines.push(`── ${category} ──`);
      lines.push(emojis.join(" "));
      lines.push("");
    }

    if (lines.length === 0) return "No emojis found for that search.";
    return lines.join("\n");
  },
};
