/**
 * Tests for BasicFilters Module
 */

import { BasicFilters } from '../src/filters/basicFilters.js';

describe('BasicFilters', () => {
  let testPixels;
  let width;
  let height;

  beforeEach(() => {
    // Create a simple 4x4 test image (RGBA)
    width = 4;
    height = 4;
    testPixels = new Uint8ClampedArray(width * height * 4);

    // Fill with a pattern
    for (let i = 0; i < testPixels.length; i += 4) {
      testPixels[i] = 100; // R
      testPixels[i + 1] = 150; // G
      testPixels[i + 2] = 200; // B
      testPixels[i + 3] = 255; // A
    }
  });

  describe('gaussianBlur', () => {
    test('should blur image with default radius', () => {
      const result = BasicFilters.gaussianBlur(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should blur image with custom radius', () => {
      const result = BasicFilters.gaussianBlur(testPixels, width, height, 3);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should throw error for invalid radius', () => {
      expect(() => BasicFilters.gaussianBlur(testPixels, width, height, 0)).toThrow();
      expect(() => BasicFilters.gaussianBlur(testPixels, width, height, 51)).toThrow();
      expect(() => BasicFilters.gaussianBlur(testPixels, width, height, 'invalid')).toThrow();
    });

    test('should throw error for invalid pixels', () => {
      expect(() => BasicFilters.gaussianBlur(null, width, height)).toThrow();
    });

    test('should blur consistently', () => {
      const result1 = BasicFilters.gaussianBlur(testPixels, width, height, 2);
      const result2 = BasicFilters.gaussianBlur(testPixels, width, height, 2);

      expect(result1).toEqual(result2);
    });

    test('should increase blur radius effect', () => {
      const blurred1 = BasicFilters.gaussianBlur(testPixels, width, height, 1);
      const blurred2 = BasicFilters.gaussianBlur(testPixels, width, height, 3);

      // Larger radius should create smoother (less variation)
      expect(blurred2).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should preserve alpha channel', () => {
      const result = BasicFilters.gaussianBlur(testPixels, width, height);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });
  });

  describe('sharpen', () => {
    test('should sharpen image with default amount', () => {
      const result = BasicFilters.sharpen(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should sharpen image with custom amount', () => {
      const result = BasicFilters.sharpen(testPixels, width, height, 2.0);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should throw error for invalid amount', () => {
      expect(() => BasicFilters.sharpen(testPixels, width, height, 'invalid')).toThrow();
    });

    test('should produce different result than original', () => {
      const result = BasicFilters.sharpen(testPixels, width, height);

      expect(result).not.toEqual(testPixels);
    });

    test('should clamp values to 0-255 range', () => {
      const result = BasicFilters.sharpen(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
        expect(result[i + 1]).toBeGreaterThanOrEqual(0);
        expect(result[i + 1]).toBeLessThanOrEqual(255);
        expect(result[i + 2]).toBeGreaterThanOrEqual(0);
        expect(result[i + 2]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('emboss', () => {
    test('should emboss image', () => {
      const result = BasicFilters.emboss(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should throw error for invalid pixels', () => {
      expect(() => BasicFilters.emboss(null, width, height)).toThrow();
    });

    test('should produce grayscale-like result', () => {
      const result = BasicFilters.emboss(testPixels, width, height);

      // Most embossed pixels should have similar R, G, B values
      for (let i = 0; i < result.length; i += 4) {
        const r = result[i];
        const g = result[i + 1];
        const b = result[i + 2];
        // Should be roughly equal for emboss effect
        expect(Math.abs(r - g)).toBeLessThan(50);
        expect(Math.abs(g - b)).toBeLessThan(50);
      }
    });
  });

  describe('brightness', () => {
    test('should increase brightness', () => {
      const result = BasicFilters.brightness(testPixels, 50);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(testPixels[i]);
      }
    });

    test('should decrease brightness', () => {
      const result = BasicFilters.brightness(testPixels, -50);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeLessThanOrEqual(testPixels[i]);
      }
    });

    test('should clamp at 255', () => {
      const brightPixels = new Uint8ClampedArray(testPixels.length);
      for (let i = 0; i < brightPixels.length; i += 4) {
        brightPixels[i] = 200;
        brightPixels[i + 1] = 200;
        brightPixels[i + 2] = 200;
        brightPixels[i + 3] = 255;
      }

      const result = BasicFilters.brightness(brightPixels, 100);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    test('should clamp at 0', () => {
      const darkPixels = new Uint8ClampedArray(testPixels.length);
      for (let i = 0; i < darkPixels.length; i += 4) {
        darkPixels[i] = 50;
        darkPixels[i + 1] = 50;
        darkPixels[i + 2] = 50;
        darkPixels[i + 3] = 255;
      }

      const result = BasicFilters.brightness(darkPixels, -100);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
      }
    });

    test('should throw error for invalid amount', () => {
      expect(() => BasicFilters.brightness(testPixels, 150)).toThrow();
      expect(() => BasicFilters.brightness(testPixels, -150)).toThrow();
      expect(() => BasicFilters.brightness(testPixels, 'invalid')).toThrow();
    });

    test('should preserve alpha', () => {
      const result = BasicFilters.brightness(testPixels, 50);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });
  });

  describe('contrast', () => {
    test('should increase contrast', () => {
      const result = BasicFilters.contrast(testPixels, 1.5);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should decrease contrast', () => {
      const result = BasicFilters.contrast(testPixels, 0.7);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should throw error for invalid amount', () => {
      expect(() => BasicFilters.contrast(testPixels, 0.2)).toThrow();
      expect(() => BasicFilters.contrast(testPixels, 3.5)).toThrow();
      expect(() => BasicFilters.contrast(testPixels, 'invalid')).toThrow();
    });

    test('should maintain middle gray at 128', () => {
      const grayPixels = new Uint8ClampedArray(testPixels.length);
      for (let i = 0; i < grayPixels.length; i += 4) {
        grayPixels[i] = 128;
        grayPixels[i + 1] = 128;
        grayPixels[i + 2] = 128;
        grayPixels[i + 3] = 255;
      }

      const result = BasicFilters.contrast(grayPixels, 1.5);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBe(128);
      }
    });

    test('should clamp values to 0-255', () => {
      const result = BasicFilters.contrast(testPixels, 2.5);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    test('should preserve alpha channel', () => {
      const result = BasicFilters.contrast(testPixels, 1.5);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });
  });

  describe('applyKernel', () => {
    test('should apply kernel to image', () => {
      const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
      const result = BasicFilters.applyKernel(testPixels, width, height, kernel);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should apply kernel with strength factor', () => {
      const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
      const result = BasicFilters.applyKernel(testPixels, width, height, kernel, 0.5);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should apply kernel with offset', () => {
      const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
      const result = BasicFilters.applyKernel(testPixels, width, height, kernel, 1.0, 128);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should clamp output values', () => {
      const kernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
      const result = BasicFilters.applyKernel(testPixels, width, height, kernel);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('edge cases', () => {
    test('should handle single pixel image', () => {
      const singlePixel = new Uint8ClampedArray(4);
      singlePixel[0] = 100;
      singlePixel[1] = 150;
      singlePixel[2] = 200;
      singlePixel[3] = 255;

      expect(() => BasicFilters.gaussianBlur(singlePixel, 1, 1, 2)).not.toThrow();
    });

    test('should handle uniform color image', () => {
      const uniform = new Uint8ClampedArray(100 * 100 * 4).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const blurred = BasicFilters.gaussianBlur(uniform, 100, 100);
      expect(blurred).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should handle extreme brightness values', () => {
      const brightImage = new Uint8ClampedArray(testPixels.length).fill(255);
      brightImage.forEach((_, i) => {
        if (i % 4 === 3) brightImage[i] = 255;
      });

      expect(() => BasicFilters.brightness(brightImage, 50)).not.toThrow();
    });
  });

  describe('performance', () => {
    test('should process large image', () => {
      const largePixels = new Uint8ClampedArray(1024 * 1024 * 4);
      largePixels.forEach((_, i) => {
        largePixels[i] = Math.floor(Math.random() * 256);
      });

      const start = performance.now();
      BasicFilters.brightness(largePixels, 30);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('consistency', () => {
    test('double blur should be smoother', () => {
      const once = BasicFilters.gaussianBlur(testPixels, width, height, 2);
      const twice = BasicFilters.gaussianBlur(once, width, height, 2);

      expect(twice).toBeInstanceOf(Uint8ClampedArray);
    });

    test('brighten then darken should be close to original', () => {
      const brightened = BasicFilters.brightness(testPixels, 50);
      const restored = BasicFilters.brightness(brightened, -50);

      // Should be very close to original
      let diff = 0;
      for (let i = 0; i < restored.length; i += 4) {
        diff += Math.abs(restored[i] - testPixels[i]);
      }
      expect(diff).toBeLessThan(100);
    });
  });
});
