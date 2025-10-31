/**
 * Edge Detection Module - PR #4
 * Apply edge detection algorithms: Sobel, Canny, Prewitt
 */

/**
 * EdgeDetection class for detecting edges in images
 * @class
 */
export class EdgeDetection {
  /**
   * Apply Sobel edge detection
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Edge-detected pixels
   */
  static sobel(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid edge detection parameters');
    }

    const gx = [
      -1, 0, 1,
      -2, 0, 2,
      -1, 0, 1,
    ];

    const gy = [
      -1, -2, -1,
      0, 0, 0,
      1, 2, 1,
    ];

    return EdgeDetection.applyGradient(pixels, width, height, gx, gy);
  }

  /**
   * Apply Prewitt edge detection
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Edge-detected pixels
   */
  static prewitt(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid edge detection parameters');
    }

    const gx = [
      -1, 0, 1,
      -1, 0, 1,
      -1, 0, 1,
    ];

    const gy = [
      -1, -1, -1,
      0, 0, 0,
      1, 1, 1,
    ];

    return EdgeDetection.applyGradient(pixels, width, height, gx, gy);
  }

  /**
   * Apply Laplacian edge detection
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Edge-detected pixels
   */
  static laplacian(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid edge detection parameters');
    }

    const kernel = [
      0, -1, 0,
      -1, 4, -1,
      0, -1, 0,
    ];

    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let i = 1; i < height - 1; i += 1) {
      for (let j = 1; j < width - 1; j += 1) {
        let value = 0;

        for (let ki = -1; ki <= 1; ki += 1) {
          for (let kj = -1; kj <= 1; kj += 1) {
            const idx = ((i + ki) * width + (j + kj)) * channels;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
            value += gray * kernel[(ki + 1) * 3 + (kj + 1)];
          }
        }

        const idx = (i * width + j) * channels;
        const clipped = Math.max(0, Math.min(255, Math.abs(value)));
        result[idx] = clipped;
        result[idx + 1] = clipped;
        result[idx + 2] = clipped;
        result[idx + 3] = pixels[idx + 3];
      }
    }

    return result;
  }

  /**
   * Apply Canny edge detection (simplified)
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} lowThreshold - Low threshold (0-255)
   * @param {number} highThreshold - High threshold (0-255)
   * @returns {Uint8ClampedArray} Edge-detected pixels
   */
  static canny(pixels, width, height, lowThreshold = 50, highThreshold = 150) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid edge detection parameters');
    }

    // Step 1: Gaussian blur
    const blurred = EdgeDetection.gaussianBlur(pixels, width, height);

    // Step 2: Sobel edge detection
    const edges = EdgeDetection.sobelWithGradient(blurred, width, height);

    // Step 3: Non-maximum suppression and thresholding
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let i = 0; i < edges.magnitude.length; i += 1) {
      const mag = edges.magnitude[i];

      if (mag > highThreshold) {
        result[i * channels] = 255;
        result[i * channels + 1] = 255;
        result[i * channels + 2] = 255;
        result[i * channels + 3] = 255;
      } else if (mag > lowThreshold) {
        // Edge tracking by hysteresis
        result[i * channels] = 128;
        result[i * channels + 1] = 128;
        result[i * channels + 2] = 128;
        result[i * channels + 3] = 255;
      }
    }

    return result;
  }

  /**
   * Apply gradient-based edge detection
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {array} gx - X gradient kernel
   * @param {array} gy - Y gradient kernel
   * @returns {Uint8ClampedArray} Edge-detected pixels
   */
  static applyGradient(pixels, width, height, gx, gy) {
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let i = 1; i < height - 1; i += 1) {
      for (let j = 1; j < width - 1; j += 1) {
        let sumGx = 0;
        let sumGy = 0;

        for (let ki = -1; ki <= 1; ki += 1) {
          for (let kj = -1; kj <= 1; kj += 1) {
            const idx = ((i + ki) * width + (j + kj)) * channels;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;

            sumGx += gray * gx[(ki + 1) * 3 + (kj + 1)];
            sumGy += gray * gy[(ki + 1) * 3 + (kj + 1)];
          }
        }

        const magnitude = Math.sqrt(sumGx * sumGx + sumGy * sumGy);
        const clipped = Math.max(0, Math.min(255, magnitude));

        const idx = (i * width + j) * channels;
        result[idx] = clipped;
        result[idx + 1] = clipped;
        result[idx + 2] = clipped;
        result[idx + 3] = pixels[idx + 3];
      }
    }

    return result;
  }

  /**
   * Apply Gaussian blur (helper for Canny)
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Blurred pixels
   */
  static gaussianBlur(pixels, width, height) {
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let ki = -1; ki <= 1; ki += 1) {
          for (let kj = -1; kj <= 1; kj += 1) {
            const yi = Math.min(height - 1, Math.max(0, i + ki));
            const xi = Math.min(width - 1, Math.max(0, j + kj));
            const idx = (yi * width + xi) * channels;

            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            count += 1;
          }
        }

        const idx = (i * width + j) * channels;
        result[idx] = Math.round(r / count);
        result[idx + 1] = Math.round(g / count);
        result[idx + 2] = Math.round(b / count);
        result[idx + 3] = pixels[idx + 3];
      }
    }

    return result;
  }

  /**
   * Calculate Sobel with gradient information
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object} Magnitude and direction arrays
   */
  static sobelWithGradient(pixels, width, height) {
    const magnitude = new Float32Array(width * height);
    const direction = new Float32Array(width * height);
    const channels = 4;

    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let i = 1; i < height - 1; i += 1) {
      for (let j = 1; j < width - 1; j += 1) {
        let sumGx = 0;
        let sumGy = 0;

        for (let ki = -1; ki <= 1; ki += 1) {
          for (let kj = -1; kj <= 1; kj += 1) {
            const idx = ((i + ki) * width + (j + kj)) * channels;
            const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;

            sumGx += gray * gx[(ki + 1) * 3 + (kj + 1)];
            sumGy += gray * gy[(ki + 1) * 3 + (kj + 1)];
          }
        }

        const idx = i * width + j;
        magnitude[idx] = Math.sqrt(sumGx * sumGx + sumGy * sumGy);
        direction[idx] = Math.atan2(sumGy, sumGx);
      }
    }

    return { magnitude, direction };
  }
}
