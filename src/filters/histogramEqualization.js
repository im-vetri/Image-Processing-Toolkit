/**
 * Histogram Equalization Module - PR #6
 * Enhance image contrast using histogram equalization
 */

/**
 * HistogramEqualization class for contrast enhancement
 * @class
 */
export class HistogramEqualization {
  /**
   * Apply standard histogram equalization
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Equalized pixels
   */
  static equalize(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid equalization parameters');
    }

    // Convert to grayscale
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i += 1) {
      const idx = i * 4;
      gray[i] = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587
        + pixels[idx + 2] * 0.114);
    }

    // Calculate histogram
    const histogram = new Uint32Array(256);
    for (let i = 0; i < gray.length; i += 1) {
      histogram[gray[i]] += 1;
    }

    // Calculate cumulative distribution
    const cdf = new Uint32Array(256);
    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i += 1) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    // Normalize CDF
    const pdfNorm = new Uint8ClampedArray(256);
    const cdfMin = cdf[0];
    const numPixels = width * height;

    for (let i = 0; i < 256; i += 1) {
      pdfNorm[i] = Math.round(((cdf[i] - cdfMin) / (numPixels - cdfMin)) * 255);
    }

    // Apply equalization to RGB channels
    const result = new Uint8ClampedArray(pixels.length);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      result[i] = pdfNorm[r];
      result[i + 1] = pdfNorm[g];
      result[i + 2] = pdfNorm[b];
      result[i + 3] = pixels[i + 3];
    }

    return result;
  }

  /**
   * Apply Contrast Limited Adaptive Histogram Equalization (CLAHE)
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} clipLimit - Contrast limit (typically 2.0 - 4.0)
   * @param {number} gridSize - Grid size for tiles (typically 8 - 16)
   * @returns {Uint8ClampedArray} Enhanced pixels
   */
  static clahe(pixels, width, height, clipLimit = 2.0, gridSize = 8) {
    if (!pixels || typeof clipLimit !== 'number' || typeof gridSize !== 'number') {
      throw new Error('Invalid CLAHE parameters');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const tileWidth = Math.ceil(width / gridSize);
    const tileHeight = Math.ceil(height / gridSize);

    // Process each tile
    for (let tileY = 0; tileY < gridSize; tileY += 1) {
      for (let tileX = 0; tileX < gridSize; tileX += 1) {
        const x1 = tileX * tileWidth;
        const y1 = tileY * tileHeight;
        const x2 = Math.min((tileX + 1) * tileWidth, width);
        const y2 = Math.min((tileY + 1) * tileHeight, height);

        const tileHistogram = HistogramEqualization.getTileHistogram(
          pixels,
          width,
          x1,
          y1,
          x2,
          y2,
        );

        // Apply clip limit
        HistogramEqualization.clipHistogram(tileHistogram, clipLimit);

        // Equalize tile
        const lut = HistogramEqualization.calculateLUT(tileHistogram);

        // Apply LUT to tile
        for (let y = y1; y < y2; y += 1) {
          for (let x = x1; x < x2; x += 1) {
            const idx = (y * width + x) * 4;
            result[idx] = lut[pixels[idx]];
            result[idx + 1] = lut[pixels[idx + 1]];
            result[idx + 2] = lut[pixels[idx + 2]];
            result[idx + 3] = pixels[idx + 3];
          }
        }
      }
    }

    return result;
  }

  /**
   * Get histogram for a tile
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} x1 - Tile left
   * @param {number} y1 - Tile top
   * @param {number} x2 - Tile right
   * @param {number} y2 - Tile bottom
   * @returns {Uint32Array} Histogram
   */
  static getTileHistogram(pixels, width, x1, y1, x2, y2) {
    const histogram = new Uint32Array(256);

    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        const idx = (y * width + x) * 4;
        const gray = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587
          + pixels[idx + 2] * 0.114);
        histogram[Math.round(gray)] += 1;
      }
    }

    return histogram;
  }

  /**
   * Clip histogram values
   * @private
   * @param {Uint32Array} histogram - Histogram to clip
   * @param {number} clipLimit - Clip limit
   */
  static clipHistogram(histogram, clipLimit) {
    const numBins = histogram.length;
    const avgBinValue = histogram.reduce((a, b) => a + b) / numBins;
    const limit = Math.round(clipLimit * avgBinValue);

    for (let i = 0; i < numBins; i += 1) {
      if (histogram[i] > limit) {
        histogram[i] = limit;
      }
    }
  }

  /**
   * Calculate lookup table from histogram
   * @private
   * @param {Uint32Array} histogram - Histogram
   * @returns {Uint8ClampedArray} Lookup table
   */
  static calculateLUT(histogram) {
    const lut = new Uint8ClampedArray(256);
    const cdf = new Uint32Array(256);

    cdf[0] = histogram[0];
    for (let i = 1; i < 256; i += 1) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }

    const numPixels = cdf[255];
    const cdfMin = cdf[0];

    for (let i = 0; i < 256; i += 1) {
      lut[i] = Math.round(((cdf[i] - cdfMin) / (numPixels - cdfMin)) * 255);
    }

    return lut;
  }

  /**
   * Get histogram of image
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint32Array} Histogram array (256 bins)
   */
  static getHistogram(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid histogram parameters');
    }

    const histogram = new Uint32Array(256);

    for (let i = 0; i < width * height; i += 1) {
      const idx = i * 4;
      const gray = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587
        + pixels[idx + 2] * 0.114);
      histogram[Math.round(gray)] += 1;
    }

    return histogram;
  }

  /**
   * Apply gamma correction
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} gamma - Gamma value (< 1 brightens, > 1 darkens)
   * @returns {Uint8ClampedArray} Gamma-corrected pixels
   */
  static gammaCorrection(pixels, gamma) {
    if (!pixels || typeof gamma !== 'number' || gamma <= 0) {
      throw new Error('Invalid gamma value');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const invGamma = 1 / gamma;
    const table = new Uint8ClampedArray(256);

    for (let i = 0; i < 256; i += 1) {
      table[i] = Math.round((i / 255) ** invGamma * 255);
    }

    for (let i = 0; i < pixels.length; i += 4) {
      result[i] = table[pixels[i]];
      result[i + 1] = table[pixels[i + 1]];
      result[i + 2] = table[pixels[i + 2]];
      result[i + 3] = pixels[i + 3];
    }

    return result;
  }

  /**
   * Apply sigmoid contrast adjustment
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} contrast - Contrast amount (-1 to 1)
   * @returns {Uint8ClampedArray} Adjusted pixels
   */
  static sigmoidContrast(pixels, contrast) {
    if (typeof contrast !== 'number' || contrast < -1 || contrast > 1) {
      throw new Error('Contrast must be between -1 and 1');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const factor = Math.exp(Math.abs(contrast) * 4);

    for (let i = 0; i < pixels.length; i += 4) {
      for (let c = 0; c < 3; c += 1) {
        let value = pixels[i + c];

        if (contrast > 0) {
          value = (value / 255) * factor;
        } else if (contrast < 0) {
          value = (value / 255) / factor;
        }

        result[i + c] = Math.max(0, Math.min(255, Math.round(value * 255)));
      }
      result[i + 3] = pixels[i + 3];
    }

    return result;
  }
}
