export type Filter = {
  name: string;
  label: string;
  settings: {
    contrast: number;
    saturate: number;
    brightness: number;
    hue: number; // in radians
    warmth: number; // custom property, will be mapped to a color overlay
    highlights?: number;
    shadows?: number;
    clarity?: number;
    tint?: number;
  };
};

// Approximate ratios to match Apple’s filters.
export const filters: Filter[] = [
  {
    name: 'original',
    label: 'Original',
    settings: { contrast: 1, saturate: 1, brightness: 1, hue: 0, warmth: 0 },
  },
  {
    name: 'vivid',
    label: 'Vivid',
    settings: {
      // Vivid: Enhances contrast and saturation for a vibrant look.
      contrast: 1.25,
      saturate: 1.3,
      brightness: 1.05,
      hue: 0,
      warmth: 0,
    },
  },
  {
    name: 'vivid-warm',
    label: 'Vivid Warm',
    settings: {
      // Vivid Warm: Adds a warm, sunny tone to the vibrant base.
      contrast: 1.25,
      saturate: 1.3,
      brightness: 1,
      hue: 0.03,
      warmth: 0.2,
    },
  },
  {
    name: 'vivid-cool',
    label: 'Vivid Cool',
    settings: {
      // Vivid Cool: Adds a cool, bluish tone to the vibrant base.
      contrast: 1.25,
      saturate: 1.3,
      brightness: 1,
      hue: -0.03,
      warmth: -0.2,
    },
  },
  {
    name: 'dramatic',
    label: 'Dramatic',
    settings: {
      // Dramatic: High contrast and muted colors for a moody, intense feel.
      contrast: 1.35,
      saturate: 0.8,
      brightness: 0.9,
      hue: 0,
      warmth: 0,
    },
  },
  {
    name: 'dramaticWarm',
    label: 'Dramatic Warm',
    settings: {
      // True Apple Dramatic Warm: high contrast + golden highlights + soft blacks
      contrast: 1.4,        // punchier midtone contrast
      brightness: 0.93,     // slight lift to exposure
      saturate: 0.85,       // retains color richness
      hue: 5,               // tilt hues toward orange (no pink/blue shift)
      warmth: 0.25,         // stronger golden temperature
      highlights: 0.88,     // soft rolloff for light glow
      shadows: 1.1,         // mild lift to preserve shadow detail
      clarity: 1.07,        // adds crisp depth
      tint: -0.02,          // slight green tint to balance out warmth (avoid pink)
    },
  },




  {
    name: 'dramatic-cool',
    label: 'Dramatic Cool',
    settings: {
      // Dramatic Cool: A cooler variant of the high-contrast Dramatic filter.
      contrast: 1.35,
      saturate: 0.8,
      brightness: 0.9,
      hue: 0,
      warmth: -0.2,
    },
  },
  {
    name: 'mono',
    label: 'Mono',
    settings: {
      // Mono: A classic black and white filter.
      contrast: 1,
      saturate: 0,
      brightness: 1,
      hue: 0,
      warmth: 0,
    },
  },
  {
    name: 'silvertone',
    label: 'Silvertone',
    settings: {
      // Silvertone: A nuanced black and white with enhanced contrast, inspired by silver gelatin prints.
      contrast: 1.1,
      saturate: 0.1,
      brightness: 1.05,
      hue: 0,
      warmth: 0,
    },
  },
  {
    name: 'noir',
    label: 'Noir',
    settings: {
      // Noir: A high-contrast black and white for a gritty, cinematic look.
      contrast: 1.25,
      saturate: 0,
      brightness: 0.95,
      hue: 0,
      warmth: 0,
    },
  },
];

/**
 * Applies a named filter to a canvas element.
 * @param canvas The HTMLCanvasElement to apply the filter to.
 * @param source The source image or canvas to draw from.
 * @param filterName The name of the filter to apply.
 */
export const applyFilter = (
  canvas: HTMLCanvasElement,
  source: HTMLImageElement | HTMLCanvasElement,
  filterName: string
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const selectedFilter = filters.find((f) => f.name === filterName);
  if (!selectedFilter) return;

  const { contrast, saturate, brightness, hue, warmth } = selectedFilter.settings;

  // Create a temporary canvas to hold the unfiltered image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = source.width;
  tempCanvas.height = source.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // Draw source to temporary canvas
  tempCtx.drawImage(source, 0, 0);

  // Set canvas dimensions
  canvas.width = source.width;
  canvas.height = source.height;

  // Apply CSS-like filters to main canvas context
  ctx.filter = [
    `brightness(${brightness})`,
    `contrast(${contrast})`,
    `saturate(${saturate})`,
    `hue-rotate(${hue}rad)`,
  ].join(' ');

  // Draw from temp canvas to main canvas with filter applied
  ctx.drawImage(tempCanvas, 0, 0);

  // Reset filter
  ctx.filter = 'none';

  // Apply warmth/coolness overlay
  if (warmth !== 0) {
    const alpha = Math.abs(warmth);
    const color = warmth > 0 ? 'rgba(255, 165, 0, ' : 'rgba(0, 0, 255, '; // Orange for warm, Blue for cool
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = `${color}${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
  }
};

/**
 * Generates a CSS filter string for the given filter name.
 * This is used for preview rendering and ensures parity with canvas export.
 * @param filterName The name of the filter to convert to CSS
 * @returns A CSS filter string (e.g., "brightness(1.1) contrast(1.2)")
 */
export const getFilterCSSString = (filterName: string): string => {
  const filter = filters.find(f => f.name === filterName);
  if (!filter || filterName === 'original') return 'none';

  const { contrast, saturate, brightness, hue } = filter.settings;
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hue}rad)`;
};

/**
 * Generates a CSS filter string with intensity control (0-100%).
 * Interpolates between original (no filter) and full filter effect.
 * @param filterName The name of the filter to apply
 * @param intensity The intensity from 0 (no effect) to 100 (full effect)
 * @returns A CSS filter string with interpolated values
 */
export const getFilterCSSStringWithIntensity = (filterName: string, intensity: number): string => {
  const filter = filters.find(f => f.name === filterName);
  if (!filter || filterName === 'original' || intensity === 0) return 'none';
  if (intensity === 100) return getFilterCSSString(filterName);
  
  const { contrast, saturate, brightness, hue } = filter.settings;
  const t = intensity / 100; // 0.0 to 1.0
  
  // Interpolate each value from 1.0 (neutral) to the filter's value
  const interpContrast = 1 + (contrast - 1) * t;
  const interpSaturate = 1 + (saturate - 1) * t;
  const interpBrightness = 1 + (brightness - 1) * t;
  const interpHue = hue * t;
  
  return `brightness(c:\Users\ashwi\OneDrive\Desktop\desk\Attachments\Documents\Text-and-image{interpBrightness}) contrast(c:\Users\ashwi\OneDrive\Desktop\desk\Attachments\Documents\Text-and-image{interpContrast}) saturate(c:\Users\ashwi\OneDrive\Desktop\desk\Attachments\Documents\Text-and-image{interpSaturate}) hue-rotate(c:\Users\ashwi\OneDrive\Desktop\desk\Attachments\Documents\Text-and-image{interpHue}rad)`;
};

