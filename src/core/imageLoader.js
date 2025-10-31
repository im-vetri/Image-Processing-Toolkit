/**
 * Image Loader Module - PR #1
 * Loads and manages image data from various formats
 * Supports: PNG, JPEG, BMP, TIFF, WebP
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * ImageLoader class for loading and managing image data
 * @class
 */
export class ImageLoader {
  /**
   * Load image from file path
   * @param {string} filePath - Path to image file
   * @returns {Promise<object>} Image data object
   * @throws {Error} If file not found or invalid format
   */
  static async fromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    const supportedFormats = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp'];

    if (!supportedFormats.includes(ext)) {
      throw new Error(`Unsupported format: ${ext}`);
    }

    const metadata = await sharp(filePath).metadata();
    const buffer = await fs.promises.readFile(filePath);

    return {
      buffer,
      metadata,
      format: ext.slice(1),
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels || 3,
      depth: metadata.depth || 8,
      filePath,
    };
  }

  /**
   * Load image from buffer
   * @param {Buffer} buffer - Image buffer
   * @returns {Promise<object>} Image data object
   */
  static async fromBuffer(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError('Input must be a Buffer');
    }

    const metadata = await sharp(buffer).metadata();

    return {
      buffer,
      metadata,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels || 3,
      depth: metadata.depth || 8,
    };
  }

  /**
   * Load image from URL
   * @param {string} url - Image URL
   * @returns {Promise<object>} Image data object
   */
  static async fromURL(url) {
    if (typeof url !== 'string') {
      throw new TypeError('URL must be a string');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.buffer();
      return ImageLoader.fromBuffer(buffer);
    } catch (error) {
      throw new Error(`Failed to load from URL: ${error.message}`);
    }
  }

  /**
   * Save image to file
   * @param {object} imageData - Image data object
   * @param {string} filePath - Output file path
   * @param {object} options - Save options (quality, format, etc)
   * @returns {Promise<void>}
   */
  static async toFile(imageData, filePath, options = {}) {
    if (!imageData || !imageData.buffer) {
      throw new Error('Invalid image data');
    }

    let pipeline = sharp(imageData.buffer);

    if (options.quality) {
      pipeline = pipeline.withMetadata().jpeg({ quality: options.quality });
    }

    if (options.format) {
      pipeline = pipeline.toFormat(options.format);
    }

    await pipeline.toFile(filePath);
  }

  /**
   * Get image statistics
   * @param {object} imageData - Image data object
   * @returns {object} Statistics
   */
  static getStats(imageData) {
    if (!imageData) {
      throw new Error('Invalid image data');
    }

    return {
      width: imageData.width,
      height: imageData.height,
      size: imageData.buffer.length,
      format: imageData.format,
      channels: imageData.channels,
      depth: imageData.depth,
      pixelCount: imageData.width * imageData.height,
      megapixels: (imageData.width * imageData.height) / 1000000,
    };
  }

  /**
   * Check if format is supported
   * @param {string} format - File format
   * @returns {boolean}
   */
  static isSupportedFormat(format) {
    const supported = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'];
    return supported.includes(format.toLowerCase());
  }
}
