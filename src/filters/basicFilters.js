/**
 * Basic Filters Module - PR #3
 * Apply common image filters: Blur, Sharpen, Emboss
 */

/**
 * BasicFilters class for standard image processing
 * @class
 */
export class BasicFilters {
  /**
   * Apply Gaussian Blur filter
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} radius - Blur radius (1-50)
   * @returns {Uint8ClampedArray} Blurred pixels
   */
  static gaussianBlur(pixels, width, height, radius = 2) {
    if (!pixels || typeof radius !== 'number' || radius < 1 || radius > 50) {
      throw new Error('Invalid blur parameters');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4; // RGBA

    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let count = 0;

        for (let ki = -radius; ki <= radius; ki += 1) {
          for (let kj = -radius; kj <= radius; kj += 1) {
            const yi = Math.min(height - 1, Math.max(0, i + ki));
            const xi = Math.min(width - 1, Math.max(0, j + kj));
            const idx = (yi * width + xi) * channels;

            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            a += pixels[idx + 3];
            count += 1;
          }
        }

        const idx = (i * width + j) * channels;
        result[idx] = Math.round(r / count);
        result[idx + 1] = Math.round(g / count);
        result[idx + 2] = Math.round(b / count);
        result[idx + 3] = Math.round(a / count);
      }
    }

    return result;
  }

  /**
   * Apply Sharpen filter
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} amount - Sharpen amount (0.1-2.0)
   * @returns {Uint8ClampedArray} Sharpened pixels
   */
  static sharpen(pixels, width, height, amount = 1.0) {
    if (!pixels || typeof amount !== 'number') {
      throw new Error('Invalid sharpen parameters');
    }

    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0,
    ];

    return BasicFilters.applyKernel(pixels, width, height, kernel, amount);
  }

  /**
   * Apply Emboss filter
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Embossed pixels
   */
  static emboss(pixels, width, height) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const kernel = [
      -2, -1, 0,
      -1, 1, 1,
      0, 1, 2,
    ];

    return BasicFilters.applyKernel(pixels, width, height, kernel, 1.0, 128);
  }

  /**
   * Apply custom kernel filter
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {array} kernel - 3x3 kernel
   * @param {number} amount - Filter strength
   * @param {number} offset - Color offset (default 0)
   * @returns {Uint8ClampedArray} Filtered pixels
   */
  static applyKernel(pixels, width, height, kernel, amount = 1.0, offset = 0) {
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let i = 1; i < height - 1; i += 1) {
      for (let j = 1; j < width - 1; j += 1) {
        let r = 0;
        let g = 0;
        let b = 0;

        for (let ki = -1; ki <= 1; ki += 1) {
          for (let kj = -1; kj <= 1; kj += 1) {
            const idx = ((i + ki) * width + (j + kj)) * channels;
            const kernelVal = kernel[(ki + 1) * 3 + (kj + 1)] * amount;

            r += pixels[idx] * kernelVal;
            g += pixels[idx + 1] * kernelVal;
            b += pixels[idx + 2] * kernelVal;
          }
        }

        const idx = (i * width + j) * channels;
        result[idx] = Math.max(0, Math.min(255, Math.round(r + offset)));
        result[idx + 1] = Math.max(0, Math.min(255, Math.round(g + offset)));
        result[idx + 2] = Math.max(0, Math.min(255, Math.round(b + offset)));
        result[idx + 3] = pixels[idx + 3];
      }
    }

    return result;
  }

  /**
   * Apply brightness adjustment
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} amount - Brightness amount (-100 to 100)
   * @returns {Uint8ClampedArray} Adjusted pixels
   */
  static brightness(pixels, amount) {
    if (typeof amount !== 'number' || amount < -100 || amount > 100) {
      throw new Error('Brightness amount must be between -100 and 100');
    }

    const result = new Uint8ClampedArray(pixels);
    const channels = 4;

    for (let i = 0; i < result.length; i += channels) {
      result[i] = Math.max(0, Math.min(255, result[i] + amount));
      result[i + 1] = Math.max(0, Math.min(255, result[i + 1] + amount));
      result[i + 2] = Math.max(0, Math.min(255, result[i + 2] + amount));
    }

    return result;
  }

  /**
   * Apply contrast adjustment
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} amount - Contrast amount (0.5 to 3.0)
   * @returns {Uint8ClampedArray} Adjusted pixels
   */
  static contrast(pixels, amount) {
    if (typeof amount !== 'number' || amount < 0.5 || amount > 3.0) {
      throw new Error('Contrast amount must be between 0.5 and 3.0');
    }

    const result = new Uint8ClampedArray(pixels);
    const channels = 4;
    const factor = (259 * (amount + 255)) / (255 * (259 - amount));

    for (let i = 0; i < result.length; i += channels) {
      result[i] = Math.max(0, Math.min(255, factor * (result[i] - 128) + 128));
      result[i + 1] = Math.max(0, Math.min(255, factor * (result[i + 1] - 128) + 128));
      result[i + 2] = Math.max(0, Math.min(255, factor * (result[i + 2] - 128) + 128));
    }

    return result;
  }
}
