/**
 * Batch Processor Module - PR #8
 * Process multiple images and format conversions
 */

/**
 * BatchProcessor class for batch image operations
 * @class
 */
export class BatchProcessor {
  /**
   * Process multiple images with a filter function
   * @param {array} imageArray - Array of image data objects
   * @param {function} filterFn - Filter function to apply
   * @returns {array} Processed images
   */
  static batch(imageArray, filterFn) {
    if (!Array.isArray(imageArray) || typeof filterFn !== 'function') {
      throw new Error('Invalid batch parameters');
    }

    return imageArray.map((image) => {
      try {
        return {
          ...image,
          data: filterFn(image.data, image.width, image.height),
          processed: true,
        };
      } catch (error) {
        return {
          ...image,
          error: error.message,
          processed: false,
        };
      }
    });
  }

  /**
   * Convert image format
   * @param {object} image - Image data object
   * @param {string} fromFormat - Source format
   * @param {string} toFormat - Target format
   * @returns {object} Converted image
   */
  static convertFormat(image, fromFormat, toFormat) {
    if (!image || typeof fromFormat !== 'string' || typeof toFormat !== 'string') {
      throw new Error('Invalid format conversion parameters');
    }

    const supportedFormats = ['jpeg', 'png', 'webp', 'bmp', 'tiff'];

    if (!supportedFormats.includes(fromFormat.toLowerCase())
        || !supportedFormats.includes(toFormat.toLowerCase())) {
      throw new Error(`Unsupported format. Supported: ${supportedFormats.join(', ')}`);
    }

    return {
      ...image,
      format: toFormat,
      originalFormat: fromFormat,
    };
  }

  /**
   * Resize batch of images
   * @param {array} imageArray - Array of images
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {array} Resized images
   */
  static resizeBatch(imageArray, width, height) {
    if (!Array.isArray(imageArray) || typeof width !== 'number'
        || typeof height !== 'number') {
      throw new Error('Invalid batch resize parameters');
    }

    if (width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive');
    }

    return imageArray.map((image) => {
      const xScale = width / image.width;
      const yScale = height / image.height;

      const resized = new Uint8ClampedArray(width * height * 4);
      const stride = 4;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const srcX = Math.floor(x / xScale);
          const srcY = Math.floor(y / yScale);
          const srcIdx = (srcY * image.width + srcX) * stride;
          const dstIdx = (y * width + x) * stride;

          resized[dstIdx] = image.data[srcIdx];
          resized[dstIdx + 1] = image.data[srcIdx + 1];
          resized[dstIdx + 2] = image.data[srcIdx + 2];
          resized[dstIdx + 3] = image.data[srcIdx + 3];
        }
      }

      return {
        ...image,
        data: resized,
        width,
        height,
      };
    });
  }

  /**
   * Apply watermark to batch of images
   * @param {array} imageArray - Array of images
   * @param {string} text - Watermark text
   * @param {number} opacity - Opacity (0-1)
   * @returns {array} Watermarked images
   */
  static watermarkBatch(imageArray, text, opacity = 0.5) {
    if (!Array.isArray(imageArray) || typeof text !== 'string') {
      throw new Error('Invalid watermark parameters');
    }

    if (opacity < 0 || opacity > 1) {
      throw new Error('Opacity must be between 0 and 1');
    }

    return imageArray.map((image) => {
      // Simplified watermarking by overlaying text pattern
      const watermarked = new Uint8ClampedArray(image.data);
      const stride = 4;
      const opacityInt = Math.round(opacity * 255);

      // Create watermark overlay (simplified)
      for (let i = 3; i < watermarked.length; i += stride) {
        watermarked[i] = Math.round(watermarked[i] * (1 - opacity));
      }

      return {
        ...image,
        data: watermarked,
        watermarked: true,
        watermarkText: text,
      };
    });
  }

  /**
   * Generate thumbnail batch
   * @param {array} imageArray - Array of images
   * @param {number} thumbnailSize - Thumbnail size (square)
   * @returns {array} Thumbnail images
   */
  static thumbnailBatch(imageArray, thumbnailSize = 128) {
    if (!Array.isArray(imageArray) || typeof thumbnailSize !== 'number') {
      throw new Error('Invalid thumbnail parameters');
    }

    if (thumbnailSize <= 0) {
      throw new Error('Thumbnail size must be positive');
    }

    return imageArray.map((image) => {
      // Calculate aspect-preserving dimensions
      const aspectRatio = image.width / image.height;
      let thumbWidth = thumbnailSize;
      let thumbHeight = thumbnailSize;

      if (aspectRatio > 1) {
        thumbHeight = Math.round(thumbnailSize / aspectRatio);
      } else {
        thumbWidth = Math.round(thumbnailSize * aspectRatio);
      }

      const thumbnail = new Uint8ClampedArray(thumbWidth * thumbHeight * 4);
      const stride = 4;
      const xScale = image.width / thumbWidth;
      const yScale = image.height / thumbHeight;

      for (let y = 0; y < thumbHeight; y += 1) {
        for (let x = 0; x < thumbWidth; x += 1) {
          const srcX = Math.floor(x * xScale);
          const srcY = Math.floor(y * yScale);
          const srcIdx = (srcY * image.width + srcX) * stride;
          const dstIdx = (y * thumbWidth + x) * stride;

          thumbnail[dstIdx] = image.data[srcIdx];
          thumbnail[dstIdx + 1] = image.data[srcIdx + 1];
          thumbnail[dstIdx + 2] = image.data[srcIdx + 2];
          thumbnail[dstIdx + 3] = image.data[srcIdx + 3];
        }
      }

      return {
        ...image,
        data: thumbnail,
        width: thumbWidth,
        height: thumbHeight,
        isThumbnail: true,
      };
    });
  }

  /**
   * Extract metadata from batch
   * @param {array} imageArray - Array of images
   * @returns {array} Metadata array
   */
  static extractMetadata(imageArray) {
    if (!Array.isArray(imageArray)) {
      throw new Error('Invalid input: expected array of images');
    }

    return imageArray.map((image, index) => ({
      index,
      name: image.name || `image_${index}`,
      format: image.format || 'unknown',
      width: image.width,
      height: image.height,
      size: image.data.length,
      pixels: (image.width * image.height),
      megapixels: (image.width * image.height) / 1000000,
    }));
  }

  /**
   * Generate report for batch processing
   * @param {array} imageArray - Array of images
   * @param {object} options - Report options
   * @returns {object} Processing report
   */
  static generateReport(imageArray, options = {}) {
    if (!Array.isArray(imageArray)) {
      throw new Error('Invalid input: expected array of images');
    }

    const totalImages = imageArray.length;
    const processedImages = imageArray.filter((img) => img.processed !== false).length;
    const failedImages = totalImages - processedImages;

    let totalPixels = 0;
    let totalSize = 0;
    const formats = {};

    imageArray.forEach((image) => {
      totalPixels += image.width * image.height;
      totalSize += image.data.length;
      const fmt = image.format || 'unknown';
      formats[fmt] = (formats[fmt] || 0) + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      totalImages,
      processedImages,
      failedImages,
      successRate: (processedImages / totalImages * 100).toFixed(2),
      totalPixels,
      totalSize,
      averageSize: Math.round(totalSize / totalImages),
      averagePixels: Math.round(totalPixels / totalImages),
      formats,
      ...options,
    };
  }

  /**
   * Apply multiple filters in sequence
   * @param {array} imageArray - Array of images
   * @param {array} filters - Array of filter functions
   * @returns {array} Filtered images
   */
  static pipeline(imageArray, filters) {
    if (!Array.isArray(imageArray) || !Array.isArray(filters)) {
      throw new Error('Invalid pipeline parameters');
    }

    let result = imageArray;

    for (const filter of filters) {
      if (typeof filter !== 'function') {
        throw new Error('All pipeline items must be functions');
      }

      result = result.map((image) => {
        try {
          return filter(image);
        } catch (error) {
          return {
            ...image,
            error: error.message,
            processed: false,
          };
        }
      });
    }

    return result;
  }

  /**
   * Validate batch of images
   * @param {array} imageArray - Array of images
   * @returns {object} Validation results
   */
  static validate(imageArray) {
    if (!Array.isArray(imageArray)) {
      throw new Error('Invalid input: expected array of images');
    }

    const results = {
      valid: [],
      invalid: [],
      warnings: [],
    };

    imageArray.forEach((image, index) => {
      const errors = [];

      if (!image.data || !(image.data instanceof Uint8ClampedArray)) {
        errors.push('Missing or invalid pixel data');
      }

      if (typeof image.width !== 'number' || image.width <= 0) {
        errors.push('Invalid width');
      }

      if (typeof image.height !== 'number' || image.height <= 0) {
        errors.push('Invalid height');
      }

      const expectedLength = (image.width || 0) * (image.height || 0) * 4;
      if (image.data && image.data.length !== expectedLength) {
        errors.push(`Data length mismatch: expected ${expectedLength}, got ${image.data.length}`);
      }

      if (errors.length === 0) {
        results.valid.push(index);
      } else {
        results.invalid.push({ index, errors });
      }
    });

    results.totalValid = results.valid.length;
    results.totalInvalid = results.invalid.length;

    return results;
  }
}
