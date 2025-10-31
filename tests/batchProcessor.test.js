/**
 * Tests for BatchProcessor Module
 */

import { BatchProcessor } from '../src/filters/batchProcessor.js';

describe('BatchProcessor', () => {
  let imageArray;
  let imageData;

  beforeEach(() => {
    imageData = new Uint8ClampedArray(16 * 16 * 4);
    for (let i = 0; i < imageData.length; i += 4) {
      imageData[i] = 100;
      imageData[i + 1] = 150;
      imageData[i + 2] = 200;
      imageData[i + 3] = 255;
    }

    imageArray = [
      {
        name: 'image1.jpg', data: imageData, width: 16, height: 16, format: 'jpeg',
      },
      {
        name: 'image2.jpg', data: imageData, width: 16, height: 16, format: 'jpeg',
      },
      {
        name: 'image3.png', data: imageData, width: 16, height: 16, format: 'png',
      },
    ];
  });

  describe('batch', () => {
    test('should process multiple images', () => {
      const filterFn = (pixels) => pixels;
      const result = BatchProcessor.batch(imageArray, filterFn);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(imageArray.length);
    });

    test('should apply filter to all images', () => {
      const brightnessFn = (pixels) => {
        const result = new Uint8ClampedArray(pixels);
        for (let i = 0; i < result.length; i += 4) {
          result[i] = Math.min(255, result[i] + 50);
          result[i + 1] = Math.min(255, result[i + 1] + 50);
          result[i + 2] = Math.min(255, result[i + 2] + 50);
        }
        return result;
      };

      const result = BatchProcessor.batch(imageArray, brightnessFn);

      result.forEach((img, idx) => {
        expect(img.processed).toBe(true);
        expect(img.name).toBe(imageArray[idx].name);
      });
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.batch(null, () => {})).toThrow();
      expect(() => BatchProcessor.batch(imageArray, 'invalid')).toThrow();
      expect(() => BatchProcessor.batch('invalid', () => {})).toThrow();
    });

    test('should handle filter errors gracefully', () => {
      const errorFn = () => {
        throw new Error('Filter failed');
      };

      const result = BatchProcessor.batch(imageArray, errorFn);

      result.forEach((img) => {
        expect(img.processed).toBe(false);
        expect(img.error).toBe('Filter failed');
      });
    });

    test('should preserve metadata', () => {
      const identity = (pixels) => pixels;
      const result = BatchProcessor.batch(imageArray, identity);

      result.forEach((img, idx) => {
        expect(img.name).toBe(imageArray[idx].name);
        expect(img.format).toBe(imageArray[idx].format);
      });
    });
  });

  describe('convertFormat', () => {
    test('should convert image format', () => {
      const image = imageArray[0];
      const result = BatchProcessor.convertFormat(image, 'jpeg', 'png');

      expect(result.format).toBe('png');
      expect(result.originalFormat).toBe('jpeg');
    });

    test('should throw error for unsupported format', () => {
      const image = imageArray[0];
      expect(() => BatchProcessor.convertFormat(image, 'jpeg', 'bmp')).not.toThrow();
      expect(() => BatchProcessor.convertFormat(image, 'jpeg', 'heic')).toThrow();
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.convertFormat(null, 'jpeg', 'png')).toThrow();
      expect(() => BatchProcessor.convertFormat(imageArray[0], 'invalid', 'png')).toThrow();
    });

    test('should preserve image data', () => {
      const image = imageArray[0];
      const result = BatchProcessor.convertFormat(image, 'jpeg', 'png');

      expect(result.data).toBe(image.data);
      expect(result.width).toBe(image.width);
      expect(result.height).toBe(image.height);
    });
  });

  describe('resizeBatch', () => {
    test('should resize multiple images', () => {
      const result = BatchProcessor.resizeBatch(imageArray, 32, 32);

      expect(result.length).toBe(imageArray.length);
      result.forEach((img) => {
        expect(img.width).toBe(32);
        expect(img.height).toBe(32);
      });
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.resizeBatch(null, 32, 32)).toThrow();
      expect(() => BatchProcessor.resizeBatch(imageArray, 'invalid', 32)).toThrow();
      expect(() => BatchProcessor.resizeBatch(imageArray, 0, 32)).toThrow();
    });

    test('should maintain data integrity', () => {
      const result = BatchProcessor.resizeBatch(imageArray, 16, 16);

      result.forEach((img) => {
        expect(img.data).toBeInstanceOf(Uint8ClampedArray);
        expect(img.data.length).toBe(16 * 16 * 4);
      });
    });
  });

  describe('watermarkBatch', () => {
    test('should add watermark to images', () => {
      const result = BatchProcessor.watermarkBatch(imageArray, 'Watermark', 0.5);

      expect(result.length).toBe(imageArray.length);
      result.forEach((img) => {
        expect(img.watermarked).toBe(true);
        expect(img.watermarkText).toBe('Watermark');
      });
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.watermarkBatch(null, 'text')).toThrow();
      expect(() => BatchProcessor.watermarkBatch(imageArray, 123)).toThrow();
      expect(() => BatchProcessor.watermarkBatch(imageArray, 'text', 1.5)).toThrow();
    });

    test('should apply opacity', () => {
      const result = BatchProcessor.watermarkBatch(imageArray, 'Watermark', 0.3);

      expect(result).toBeInstanceOf(Array);
      result.forEach((img) => {
        expect(img.data).toBeInstanceOf(Uint8ClampedArray);
      });
    });

    test('should preserve image dimensions', () => {
      const result = BatchProcessor.watermarkBatch(imageArray, 'Test', 0.5);

      result.forEach((img, idx) => {
        expect(img.width).toBe(imageArray[idx].width);
        expect(img.height).toBe(imageArray[idx].height);
      });
    });
  });

  describe('thumbnailBatch', () => {
    test('should generate thumbnails', () => {
      const result = BatchProcessor.thumbnailBatch(imageArray, 64);

      expect(result.length).toBe(imageArray.length);
      result.forEach((thumb) => {
        expect(thumb.isThumbnail).toBe(true);
        expect(thumb.width).toBeLessThanOrEqual(64);
        expect(thumb.height).toBeLessThanOrEqual(64);
      });
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.thumbnailBatch(null, 64)).toThrow();
      expect(() => BatchProcessor.thumbnailBatch(imageArray, 'invalid')).toThrow();
      expect(() => BatchProcessor.thumbnailBatch(imageArray, 0)).toThrow();
    });

    test('should preserve aspect ratio', () => {
      const squareImage = {
        name: 'square.jpg',
        data: imageData,
        width: 16,
        height: 16,
        format: 'jpeg',
      };

      const result = BatchProcessor.thumbnailBatch([squareImage], 64);

      expect(result[0].width).toBe(result[0].height);
    });

    test('should reduce size', () => {
      const result = BatchProcessor.thumbnailBatch(imageArray, 64);

      result.forEach((thumb) => {
        expect(thumb.width * thumb.height).toBeLessThanOrEqual(64 * 64);
      });
    });
  });

  describe('extractMetadata', () => {
    test('should extract metadata from batch', () => {
      const metadata = BatchProcessor.extractMetadata(imageArray);

      expect(Array.isArray(metadata)).toBe(true);
      expect(metadata.length).toBe(imageArray.length);
    });

    test('should include required fields', () => {
      const metadata = BatchProcessor.extractMetadata(imageArray);

      metadata.forEach((item, idx) => {
        expect(item.index).toBe(idx);
        expect(item.name).toBe(imageArray[idx].name);
        expect(item.format).toBe(imageArray[idx].format);
        expect(item.width).toBe(imageArray[idx].width);
        expect(item.height).toBe(imageArray[idx].height);
        expect(typeof item.size).toBe('number');
        expect(typeof item.pixels).toBe('number');
        expect(typeof item.megapixels).toBe('number');
      });
    });

    test('should throw error for invalid input', () => {
      expect(() => BatchProcessor.extractMetadata(null)).toThrow();
      expect(() => BatchProcessor.extractMetadata('invalid')).toThrow();
    });

    test('should calculate megapixels correctly', () => {
      const metadata = BatchProcessor.extractMetadata(imageArray);

      metadata.forEach((item) => {
        expect(item.megapixels).toBe((item.width * item.height) / 1000000);
      });
    });
  });

  describe('generateReport', () => {
    test('should generate processing report', () => {
      const report = BatchProcessor.generateReport(imageArray);

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('totalImages');
      expect(report).toHaveProperty('processedImages');
      expect(report).toHaveProperty('successRate');
      expect(report).toHaveProperty('totalPixels');
      expect(report).toHaveProperty('formats');
    });

    test('should throw error for invalid input', () => {
      expect(() => BatchProcessor.generateReport(null)).toThrow();
      expect(() => BatchProcessor.generateReport('invalid')).toThrow();
    });

    test('should count images correctly', () => {
      const report = BatchProcessor.generateReport(imageArray);

      expect(report.totalImages).toBe(imageArray.length);
      expect(report.processedImages).toBe(imageArray.length);
      expect(report.failedImages).toBe(0);
    });

    test('should track format statistics', () => {
      const report = BatchProcessor.generateReport(imageArray);

      expect(report.formats.jpeg).toBe(2);
      expect(report.formats.png).toBe(1);
    });

    test('should accept custom options', () => {
      const customOptions = { custom: 'value', user: 'metadata' };
      const report = BatchProcessor.generateReport(imageArray, customOptions);

      expect(report.custom).toBe('value');
      expect(report.user).toBe('metadata');
    });
  });

  describe('pipeline', () => {
    test('should apply multiple filters in sequence', () => {
      const filters = [
        (img) => ({ ...img, processed: true }),
        (img) => ({ ...img, stepped: true }),
      ];

      const result = BatchProcessor.pipeline(imageArray, filters);

      expect(result.length).toBe(imageArray.length);
      result.forEach((img) => {
        expect(img.processed).toBe(true);
        expect(img.stepped).toBe(true);
      });
    });

    test('should throw error for invalid parameters', () => {
      expect(() => BatchProcessor.pipeline(null, [])).toThrow();
      expect(() => BatchProcessor.pipeline(imageArray, null)).toThrow();
      expect(() => BatchProcessor.pipeline(imageArray, [null])).toThrow();
    });

    test('should handle filter errors', () => {
      const filters = [
        () => {
          throw new Error('Pipeline error');
        },
      ];

      const result = BatchProcessor.pipeline(imageArray, filters);

      result.forEach((img) => {
        expect(img.error).toBe('Pipeline error');
        expect(img.processed).toBe(false);
      });
    });

    test('should process in order', () => {
      const order = [];
      const filters = [
        (img) => {
          order.push(1);
          return img;
        },
        (img) => {
          order.push(2);
          return img;
        },
      ];

      BatchProcessor.pipeline(imageArray, filters);

      expect(order[0]).toBe(1);
      expect(order[1]).toBe(2);
    });
  });

  describe('validate', () => {
    test('should validate image batch', () => {
      const validation = BatchProcessor.validate(imageArray);

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('invalid');
      expect(validation).toHaveProperty('totalValid');
      expect(validation).toHaveProperty('totalInvalid');
    });

    test('should identify valid images', () => {
      const validation = BatchProcessor.validate(imageArray);

      expect(validation.valid.length).toBe(imageArray.length);
      expect(validation.invalid.length).toBe(0);
    });

    test('should throw error for invalid input', () => {
      expect(() => BatchProcessor.validate(null)).toThrow();
      expect(() => BatchProcessor.validate('invalid')).toThrow();
    });

    test('should detect invalid images', () => {
      const invalid = [
        {
          name: 'bad.jpg', width: -1, height: 16, format: 'jpeg',
        },
        {
          name: 'bad2.jpg', data: imageData, width: 16, format: 'jpeg',
        },
      ];

      const validation = BatchProcessor.validate(invalid);

      expect(validation.invalid.length).toBeGreaterThan(0);
    });

    test('should report detailed errors', () => {
      const invalid = [
        {
          name: 'bad.jpg', data: imageData, width: 0, height: 16, format: 'jpeg',
        },
      ];

      const validation = BatchProcessor.validate(invalid);

      expect(validation.invalid[0].errors).toBeDefined();
      expect(validation.invalid[0].errors.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('should handle empty batch', () => {
      const result = BatchProcessor.batch([], (p) => p);
      expect(result).toEqual([]);
    });

    test('should handle single image', () => {
      const single = [imageArray[0]];
      const result = BatchProcessor.batch(single, (p) => p);

      expect(result.length).toBe(1);
    });

    test('should handle large batch', () => {
      const largeBatch = Array(100).fill(imageArray[0]);
      const result = BatchProcessor.batch(largeBatch, (p) => p);

      expect(result.length).toBe(100);
    });

    test('should handle mixed formats', () => {
      const mixed = [
        { ...imageArray[0], format: 'jpeg' },
        { ...imageArray[1], format: 'png' },
        { ...imageArray[2], format: 'webp' },
      ];

      const report = BatchProcessor.generateReport(mixed);

      expect(report.formats.jpeg).toBe(1);
      expect(report.formats.png).toBe(1);
      expect(report.formats.webp).toBe(1);
    });
  });

  describe('composition', () => {
    test('should compose resize and thumbnail', () => {
      let result = BatchProcessor.resizeBatch(imageArray, 32, 32);
      result = BatchProcessor.thumbnailBatch(result, 16);

      expect(result.length).toBe(imageArray.length);
      result.forEach((img) => {
        expect(img.isThumbnail).toBe(true);
      });
    });

    test('should apply pipeline with batch operations', () => {
      const filters = [
        (images) => BatchProcessor.resizeBatch(images, 24, 24),
        (images) => BatchProcessor.watermarkBatch(images, 'Processed'),
      ];

      expect(() => {
        // Need to flatten the pipeline result
        let current = imageArray;
        for (const filter of filters) {
          current = filter(current);
        }
      }).not.toThrow();
    });
  });
});
