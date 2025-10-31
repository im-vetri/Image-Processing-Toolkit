/**
 * Color Space Conversion Module - PR #2
 * Convert between different color spaces
 * Supports: RGB, HSL, HSV, CMYK, Grayscale, Sepia
 */

/**
 * ColorSpace class for color conversions
 * @class
 */
export class ColorSpace {
  /**
   * Convert RGB to Grayscale (Luminosity method)
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {number} Grayscale value (0-255)
   */
  static rgbToGrayscale(r, g, b) {
    if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
      throw new TypeError('RGB values must be numbers');
    }

    // Luminosity method (most accurate to human perception)
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  /**
   * Convert RGB to HSL
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {object} { h: 0-360, s: 0-100, l: 0-100 }
   */
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
        default:
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Convert HSL to RGB
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {object} { r, g, b } (0-255)
   */
  static hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r;
    let g;
    let b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        let t2 = t;
        if (t2 < 0) t2 += 1;
        if (t2 > 1) t2 -= 1;
        if (t2 < 1 / 6) return p + (q - p) * 6 * t2;
        if (t2 < 1 / 2) return q;
        if (t2 < 2 / 3) return p + (q - p) * (2 / 3 - t2) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * Convert RGB to HSV
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {object} { h: 0-360, s: 0-100, v: 0-100 }
   */
  static rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
        default:
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }

  /**
   * Convert RGB to CMYK
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {object} { c, m, y, k } (0-100)
   */
  static rgbToCmyk(r, g, b) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;

    const k = 1 - Math.max(rr, gg, bb);
    const c = (1 - rr - k) / (1 - k) || 0;
    const m = (1 - gg - k) / (1 - k) || 0;
    const y = (1 - bb - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  }

  /**
   * Apply Sepia tone effect (RGB values)
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {object} { r, g, b } (0-255) Sepia toned
   */
  static toSepia(r, g, b) {
    const tr = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
    const tg = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
    const tb = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));

    return { r: tr, g: tg, b: tb };
  }

  /**
   * Adjust brightness
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @param {number} factor - Brightness factor (0.5 = darker, 1.5 = brighter)
   * @returns {object} { r, g, b } (0-255)
   */
  static adjustBrightness(r, g, b, factor) {
    if (typeof factor !== 'number' || factor < 0) {
      throw new Error('Factor must be a positive number');
    }

    return {
      r: Math.min(255, Math.round(r * factor)),
      g: Math.min(255, Math.round(g * factor)),
      b: Math.min(255, Math.round(b * factor)),
    };
  }
}
