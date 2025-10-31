/**
 * Tests for EdgeDetection Module
 */

import { EdgeDetection } from '../src/filters/edgeDetection.js';

describe('EdgeDetection', () => {
  let testPixels;
  let width;
  let height;

  beforeEach(() => {
    width = 5;
    height = 5;
    testPixels = new Uint8ClampedArray(width * height * 4);

    // Create a simple edge pattern (vertical line in middle)
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        if (x < 2) {
          testPixels[idx] = 0;
          testPixels[idx + 1] = 0;
          testPixels[idx + 2] = 0;
        } else {
          testPixels[idx] = 255;
          testPixels[idx + 1] = 255;
          testPixels[idx + 2] = 255;
        }
        testPixels[idx + 3] = 255;
      }
    }
  });

  describe('sobel', () => {
    test('should detect edges with Sobel', () => {
      const result = EdgeDetection.sobel(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => EdgeDetection.sobel(null, width, height)).toThrow();
      expect(() => EdgeDetection.sobel(testPixels, 'invalid', height)).toThrow();
    });

    test('should detect edge location', () => {
      const result = EdgeDetection.sobel(testPixels, width, height);

      // Middle columns should have higher values (edges)
      let centerSum = 0;
      for (let y = 1; y < height - 1; y += 1) {
        const idx = (y * width + 2) * 4;
        centerSum += result[idx];
      }

      expect(centerSum).toBeGreaterThan(0);
    });

    test('should produce consistent results', () => {
      const result1 = EdgeDetection.sobel(testPixels, width, height);
      const result2 = EdgeDetection.sobel(testPixels, width, height);

      expect(result1).toEqual(result2);
    });

    test('should clamp values to 0-255', () => {
      const result = EdgeDetection.sobel(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('prewitt', () => {
    test('should detect edges with Prewitt', () => {
      const result = EdgeDetection.prewitt(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => EdgeDetection.prewitt(null, width, height)).toThrow();
      expect(() => EdgeDetection.prewitt(testPixels, 0, height)).toThrow();
    });

    test('should detect strong edges at transitions', () => {
      const result = EdgeDetection.prewitt(testPixels, width, height);

      let edgeCount = 0;
      for (let i = 0; i < result.length; i += 4) {
        if (result[i] > 128) edgeCount += 1;
      }

      expect(edgeCount).toBeGreaterThan(0);
    });

    test('should produce grayscale output', () => {
      const result = EdgeDetection.prewitt(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBe(result[i + 1]);
        expect(result[i + 1]).toBe(result[i + 2]);
      }
    });
  });

  describe('laplacian', () => {
    test('should detect edges with Laplacian', () => {
      const result = EdgeDetection.laplacian(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => EdgeDetection.laplacian(null, width, height)).toThrow();
      expect(() => EdgeDetection.laplacian(testPixels, -1, height)).toThrow();
    });

    test('should produce different result than original', () => {
      const result = EdgeDetection.laplacian(testPixels, width, height);

      let different = false;
      for (let i = 0; i < result.length && !different; i += 4) {
        if (result[i] !== testPixels[i]) {
          different = true;
        }
      }

      expect(different).toBe(true);
    });

    test('should clamp values to 0-255', () => {
      const result = EdgeDetection.laplacian(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    test('should preserve alpha channel', () => {
      const result = EdgeDetection.laplacian(testPixels, width, height);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });
  });

  describe('canny', () => {
    test('should detect edges with Canny', () => {
      const result = EdgeDetection.canny(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should accept custom thresholds', () => {
      const result = EdgeDetection.canny(testPixels, width, height, 30, 100);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => EdgeDetection.canny(null, width, height)).toThrow();
      expect(() => EdgeDetection.canny(testPixels, 'invalid', height)).toThrow();
    });

    test('should produce result with strong edges', () => {
      const result = EdgeDetection.canny(testPixels, width, height, 50, 150);

      let edgePixels = 0;
      for (let i = 0; i < result.length; i += 4) {
        if (result[i] > 0) edgePixels += 1;
      }

      expect(edgePixels).toBeGreaterThan(0);
    });

    test('should produce different results with different thresholds', () => {
      const result1 = EdgeDetection.canny(testPixels, width, height, 50, 150);
      const result2 = EdgeDetection.canny(testPixels, width, height, 30, 100);

      let different = false;
      for (let i = 0; i < result1.length; i += 1) {
        if (result1[i] !== result2[i]) {
          different = true;
          break;
        }
      }

      expect(different).toBe(true);
    });
  });

  describe('Sobel gradient', () => {
    test('should calculate magnitude and direction', () => {
      const result = EdgeDetection.sobelWithGradient(testPixels, width, height);

      expect(result.magnitude).toBeInstanceOf(Float32Array);
      expect(result.direction).toBeInstanceOf(Float32Array);
      expect(result.magnitude.length).toBe(width * height);
      expect(result.direction.length).toBe(width * height);
    });

    test('should have positive magnitudes', () => {
      const result = EdgeDetection.sobelWithGradient(testPixels, width, height);

      for (let i = 0; i < result.magnitude.length; i += 1) {
        expect(result.magnitude[i]).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have valid direction values', () => {
      const result = EdgeDetection.sobelWithGradient(testPixels, width, height);

      for (let i = 0; i < result.direction.length; i += 1) {
        expect(result.direction[i]).toBeGreaterThanOrEqual(-Math.PI);
        expect(result.direction[i]).toBeLessThanOrEqual(Math.PI);
      }
    });
  });

  describe('edge case handling', () => {
    test('should handle uniform image', () => {
      const uniform = new Uint8ClampedArray(width * height * 4).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const result = EdgeDetection.sobel(uniform, width, height);
      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should handle very small image', () => {
      const tiny = new Uint8ClampedArray(4 * 4);
      tiny[3] = 255;

      expect(() => EdgeDetection.sobel(tiny, 1, 1)).not.toThrow();
    });

    test('should handle high contrast edges', () => {
      const contrast = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < contrast.length; i += 4) {
        contrast[i] = (i / 4) % width < width / 2 ? 0 : 255;
        contrast[i + 1] = contrast[i];
        contrast[i + 2] = contrast[i];
        contrast[i + 3] = 255;
      }

      const result = EdgeDetection.sobel(contrast, width, height);
      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });
  });

  describe('algorithm comparison', () => {
    test('Sobel and Prewitt should produce similar results', () => {
      const sobel = EdgeDetection.sobel(testPixels, width, height);
      const prewitt = EdgeDetection.prewitt(testPixels, width, height);

      // Should be in same general range
      let sobelSum = 0;
      let prewittSum = 0;

      for (let i = 0; i < sobel.length; i += 4) {
        sobelSum += sobel[i];
        prewittSum += prewitt[i];
      }

      expect(Math.abs(sobelSum - prewittSum)).toBeLessThan(sobelSum * 0.5);
    });

    test('Laplacian should detect more details', () => {
      const laplacian = EdgeDetection.laplacian(testPixels, width, height);
      let laplacianEdges = 0;

      for (let i = 0; i < laplacian.length; i += 4) {
        if (laplacian[i] > 50) laplacianEdges += 1;
      }

      expect(laplacianEdges).toBeGreaterThan(0);
    });
  });

  describe('gradient helpers', () => {
    test('gaussianBlur should return blurred image', () => {
      const result = EdgeDetection.gaussianBlur(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('applyGradient should apply custom kernels', () => {
      const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

      const result = EdgeDetection.applyGradient(testPixels, width, height, gx, gy);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });
  });

  describe('output properties', () => {
    test('all edge detection methods should preserve alpha', () => {
      const methods = [
        (p) => EdgeDetection.sobel(p, width, height),
        (p) => EdgeDetection.prewitt(p, width, height),
        (p) => EdgeDetection.laplacian(p, width, height),
        (p) => EdgeDetection.canny(p, width, height),
      ];

      for (const method of methods) {
        const result = method(testPixels);
        for (let i = 3; i < result.length; i += 4) {
          expect(result[i]).toBeGreaterThan(0);
        }
      }
    });

    test('should produce grayscale output', () => {
      const methods = [
        (p) => EdgeDetection.sobel(p, width, height),
        (p) => EdgeDetection.prewitt(p, width, height),
        (p) => EdgeDetection.laplacian(p, width, height),
      ];

      for (const method of methods) {
        const result = method(testPixels);
        for (let i = 0; i < result.length - 3; i += 4) {
          expect(result[i]).toBe(result[i + 1]);
          expect(result[i + 1]).toBe(result[i + 2]);
        }
      }
    });
  });
});
