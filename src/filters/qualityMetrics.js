/**
 * Quality Metrics Module - PR #7
 * Image quality assessment metrics: PSNR, SSIM, Sharpness
 */

/**
 * QualityMetrics class for image quality assessment
 * @class
 */
export class QualityMetrics {
  /**
   * Calculate Peak Signal-to-Noise Ratio (PSNR)
   * @param {Uint8ClampedArray} original - Original pixel data
   * @param {Uint8ClampedArray} compressed - Compressed pixel data
   * @returns {number} PSNR value in decibels
   */
  static psnr(original, compressed) {
    if (!original || !compressed || original.length !== compressed.length) {
      throw new Error('Invalid pixel data for PSNR calculation');
    }

    let mse = 0;
    for (let i = 0; i < original.length; i += 1) {
      const diff = original[i] - compressed[i];
      mse += diff * diff;
    }

    mse /= original.length;

    if (mse === 0) {
      return 100; // Perfect match
    }

    const maxPixelValue = 255;
    return 10 * Math.log10((maxPixelValue * maxPixelValue) / mse);
  }

  /**
   * Calculate Structural Similarity Index (SSIM)
   * @param {Uint8ClampedArray} original - Original pixel data
   * @param {Uint8ClampedArray} compressed - Compressed pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} windowSize - Sliding window size (default 11)
   * @returns {number} SSIM value (0-1)
   */
  static ssim(original, compressed, width, height, windowSize = 11) {
    if (!original || !compressed || original.length !== compressed.length) {
      throw new Error('Invalid pixel data for SSIM calculation');
    }

    const stride = 4;
    const c1 = 6.5025;
    const c2 = 58.5225;
    let ssimSum = 0;
    let count = 0;

    for (let y = 0; y + windowSize <= height; y += windowSize) {
      for (let x = 0; x + windowSize <= width; x += windowSize) {
        const stats = QualityMetrics.getWindowStats(
          original,
          compressed,
          width,
          x,
          y,
          windowSize,
          stride,
        );

        const numerator = (2 * stats.muXmuY + c1)
          * (2 * stats.sigmaXY + c2);
        const denominator = (stats.muX2 + stats.muY2 + c1)
          * (stats.sigmaX2 + stats.sigmaY2 + c2);

        ssimSum += numerator / denominator;
        count += 1;
      }
    }

    return count > 0 ? ssimSum / count : 0;
  }

  /**
   * Get statistics for SSIM window
   * @private
   * @param {Uint8ClampedArray} original - Original pixels
   * @param {Uint8ClampedArray} compressed - Compressed pixels
   * @param {number} width - Image width
   * @param {number} startX - Window start X
   * @param {number} startY - Window start Y
   * @param {number} windowSize - Window size
   * @param {number} stride - Pixel stride
   * @returns {object} Window statistics
   */
  static getWindowStats(
    original,
    compressed,
    width,
    startX,
    startY,
    windowSize,
    stride,
  ) {
    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    let sumXY = 0;
    let sumXsq = 0;
    let sumYsq = 0;
    let sumXsqYsq = 0;
    let pixelCount = 0;

    for (let y = 0; y < windowSize; y += 1) {
      for (let x = 0; x < windowSize; x += 1) {
        const idx = ((startY + y) * width + (startX + x)) * stride;
        const pixelX = original[idx];
        const pixelY = compressed[idx];

        sumX += pixelX;
        sumY += pixelY;
        sumX2 += pixelX * pixelX;
        sumY2 += pixelY * pixelY;
        sumXY += pixelX * pixelY;
        sumXsq += pixelX * pixelX;
        sumYsq += pixelY * pixelY;
        sumXsqYsq += pixelX * pixelX * pixelY * pixelY;

        pixelCount += 1;
      }
    }

    const muX = sumX / pixelCount;
    const muY = sumY / pixelCount;
    const muX2 = muX * muX;
    const muY2 = muY * muY;
    const muXmuY = muX * muY;
    const sigmaX2 = (sumX2 / pixelCount) - muX2;
    const sigmaY2 = (sumY2 / pixelCount) - muY2;
    const sigmaXY = (sumXY / pixelCount) - muXmuY;

    return {
      muX2, muY2, muXmuY, sigmaX2, sigmaY2, sigmaXY,
    };
  }

  /**
   * Calculate image sharpness score (higher = sharper)
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {number} Sharpness score (0-100)
   */
  static sharpness(pixels, width, height) {
    if (!pixels || typeof width !== 'number' || typeof height !== 'number') {
      throw new Error('Invalid sharpness parameters');
    }

    // Use Laplacian kernel to detect edges
    const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
    let laplacianSum = 0;
    const stride = 4;

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        let value = 0;

        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const idx = ((y + ky) * width + (x + kx)) * stride;
            const gray = (pixels[idx] * 0.299 + pixels[idx + 1] * 0.587
              + pixels[idx + 2] * 0.114);
            value += gray * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }

        laplacianSum += Math.abs(value);
      }
    }

    const maxSharpness = 255 * 8 * ((width - 2) * (height - 2));
    return Math.min(100, (laplacianSum / maxSharpness) * 100);
  }

  /**
   * Calculate Mean Squared Error (MSE)
   * @param {Uint8ClampedArray} original - Original pixel data
   * @param {Uint8ClampedArray} compressed - Compressed pixel data
   * @returns {number} MSE value
   */
  static mse(original, compressed) {
    if (!original || !compressed || original.length !== compressed.length) {
      throw new Error('Invalid pixel data for MSE calculation');
    }

    let sum = 0;
    for (let i = 0; i < original.length; i += 1) {
      const diff = original[i] - compressed[i];
      sum += diff * diff;
    }

    return sum / original.length;
  }

  /**
   * Calculate contrast metric
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @returns {number} Contrast value (0-1)
   */
  static contrast(pixels) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const stride = 4;
    let min = 255;
    let max = 0;

    for (let i = 0; i < pixels.length; i += stride) {
      const gray = (pixels[i] * 0.299 + pixels[i + 1] * 0.587
        + pixels[i + 2] * 0.114);
      if (gray < min) min = gray;
      if (gray > max) max = gray;
    }

    return (max - min) / 255;
  }

  /**
   * Calculate brightness metric
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @returns {number} Average brightness (0-255)
   */
  static brightness(pixels) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const stride = 4;
    let sum = 0;

    for (let i = 0; i < pixels.length; i += stride) {
      const gray = (pixels[i] * 0.299 + pixels[i + 1] * 0.587
        + pixels[i + 2] * 0.114);
      sum += gray;
    }

    return sum / (pixels.length / stride);
  }

  /**
   * Calculate entropy (information content)
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @returns {number} Entropy value (0-8)
   */
  static entropy(pixels) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const histogram = new Uint32Array(256);
    const stride = 4;

    for (let i = 0; i < pixels.length; i += stride) {
      const gray = (pixels[i] * 0.299 + pixels[i + 1] * 0.587
        + pixels[i + 2] * 0.114);
      histogram[Math.round(gray)] += 1;
    }

    const numPixels = pixels.length / stride;
    let entropy = 0;

    for (let i = 0; i < 256; i += 1) {
      if (histogram[i] > 0) {
        const p = histogram[i] / numPixels;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * Compare two images and return quality metrics
   * @param {Uint8ClampedArray} original - Original pixel data
   * @param {Uint8ClampedArray} compressed - Compressed pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object} Comprehensive quality metrics
   */
  static compare(original, compressed, width, height) {
    if (!original || !compressed || original.length !== compressed.length) {
      throw new Error('Invalid pixel data for comparison');
    }

    return {
      psnr: QualityMetrics.psnr(original, compressed),
      ssim: QualityMetrics.ssim(original, compressed, width, height),
      mse: QualityMetrics.mse(original, compressed),
      originalSharpness: QualityMetrics.sharpness(original, width, height),
      compressedSharpness: QualityMetrics.sharpness(compressed, width, height),
      originalContrast: QualityMetrics.contrast(original),
      compressedContrast: QualityMetrics.contrast(compressed),
      originalBrightness: QualityMetrics.brightness(original),
      compressedBrightness: QualityMetrics.brightness(compressed),
      originalEntropy: QualityMetrics.entropy(original),
      compressedEntropy: QualityMetrics.entropy(compressed),
    };
  }
}
