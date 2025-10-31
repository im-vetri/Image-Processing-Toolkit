/**
 * Tests for HistogramEqualization Module
 */

import { HistogramEqualization } from '../src/filters/histogramEqualization.js';

describe('HistogramEqualization', () => {
  let testPixels;
  let width;
  let height;

  beforeEach(() => {
    width = 8;
    height = 8;
    testPixels = new Uint8ClampedArray(width * height * 4);

    // Create low-contrast image
    for (let i = 0; i < testPixels.length; i += 4) {
      testPixels[i] = 100;
      testPixels[i + 1] = 120;
      testPixels[i + 2] = 110;
      testPixels[i + 3] = 255;
    }

    // Add some variation
    for (let i = 0; i < testPixels.length; i += 8) {
      testPixels[i] = 150;
      testPixels[i + 1] = 140;
      testPixels[i + 2] = 130;
    }
  });

  describe('equalize', () => {
    test('should equalize histogram', () => {
      const result = HistogramEqualization.equalize(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should improve contrast', () => {
      const result = HistogramEqualization.equalize(testPixels, width, height);

      // Calculate brightness range
      let minVal = 255;
      let maxVal = 0;

      for (let i = 0; i < result.length; i += 4) {
        minVal = Math.min(minVal, result[i]);
        maxVal = Math.max(maxVal, result[i]);
      }

      const range = maxVal - minVal;
      expect(range).toBeGreaterThan(0);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => HistogramEqualization.equalize(null, width, height)).toThrow();
      expect(() => HistogramEqualization.equalize(testPixels, 'invalid', height)).toThrow();
    });

    test('should preserve alpha channel', () => {
      const result = HistogramEqualization.equalize(testPixels, width, height);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });

    test('should produce consistent results', () => {
      const result1 = HistogramEqualization.equalize(testPixels, width, height);
      const result2 = HistogramEqualization.equalize(testPixels, width, height);

      expect(result1).toEqual(result2);
    });

    test('should clamp values to 0-255', () => {
      const result = HistogramEqualization.equalize(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('clahe', () => {
    test('should apply CLAHE', () => {
      const result = HistogramEqualization.clahe(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should accept custom parameters', () => {
      const result = HistogramEqualization.clahe(testPixels, width, height, 3.0, 16);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => HistogramEqualization.clahe(null, width, height)).toThrow();
      expect(() => HistogramEqualization.clahe(testPixels, 'invalid', height)).toThrow();
      expect(() => HistogramEqualization.clahe(testPixels, width, height, 'invalid')).toThrow();
    });

    test('should preserve alpha channel', () => {
      const result = HistogramEqualization.clahe(testPixels, width, height);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });

    test('should produce output within valid range', () => {
      const result = HistogramEqualization.clahe(testPixels, width, height);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    test('different tile sizes should produce different results', () => {
      const result1 = HistogramEqualization.clahe(testPixels, width, height, 2.0, 4);
      const result2 = HistogramEqualization.clahe(testPixels, width, height, 2.0, 16);

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

  describe('getHistogram', () => {
    test('should calculate histogram', () => {
      const histogram = HistogramEqualization.getHistogram(testPixels, width, height);

      expect(histogram).toBeInstanceOf(Uint32Array);
      expect(histogram.length).toBe(256);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => HistogramEqualization.getHistogram(null, width, height)).toThrow();
      expect(() => HistogramEqualization.getHistogram(testPixels, 'invalid', height)).toThrow();
    });

    test('histogram sum should equal pixel count', () => {
      const histogram = HistogramEqualization.getHistogram(testPixels, width, height);

      let sum = 0;
      for (let i = 0; i < histogram.length; i += 1) {
        sum += histogram[i];
      }

      expect(sum).toBe(width * height);
    });

    test('should have non-zero values for image colors', () => {
      const histogram = HistogramEqualization.getHistogram(testPixels, width, height);

      let nonZero = 0;
      for (let i = 0; i < histogram.length; i += 1) {
        if (histogram[i] > 0) nonZero += 1;
      }

      expect(nonZero).toBeGreaterThan(0);
    });
  });

  describe('gammaCorrection', () => {
    test('should apply gamma correction', () => {
      const result = HistogramEqualization.gammaCorrection(testPixels, 2.2);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should brighten with gamma < 1', () => {
      const dark = new Uint8ClampedArray(testPixels.length);
      for (let i = 0; i < dark.length; i += 4) {
        dark[i] = 50;
        dark[i + 1] = 50;
        dark[i + 2] = 50;
        dark[i + 3] = 255;
      }

      const result = HistogramEqualization.gammaCorrection(dark, 0.5);

      let resultBright = 0;
      for (let i = 0; i < result.length; i += 4) {
        resultBright += result[i];
      }

      let originalBright = 0;
      for (let i = 0; i < dark.length; i += 4) {
        originalBright += dark[i];
      }

      expect(resultBright).toBeGreaterThan(originalBright);
    });

    test('should darken with gamma > 1', () => {
      const bright = new Uint8ClampedArray(testPixels.length);
      for (let i = 0; i < bright.length; i += 4) {
        bright[i] = 200;
        bright[i + 1] = 200;
        bright[i + 2] = 200;
        bright[i + 3] = 255;
      }

      const result = HistogramEqualization.gammaCorrection(bright, 2.2);

      let resultDark = 0;
      for (let i = 0; i < result.length; i += 4) {
        resultDark += result[i];
      }

      let originalBright = 0;
      for (let i = 0; i < bright.length; i += 4) {
        originalBright += bright[i];
      }

      expect(resultDark).toBeLessThan(originalBright);
    });

    test('should throw error for invalid gamma', () => {
      expect(() => HistogramEqualization.gammaCorrection(testPixels, 0)).toThrow();
      expect(() => HistogramEqualization.gammaCorrection(testPixels, -1)).toThrow();
      expect(() => HistogramEqualization.gammaCorrection(testPixels, 'invalid')).toThrow();
    });

    test('should clamp values to 0-255', () => {
      const result = HistogramEqualization.gammaCorrection(testPixels, 3.0);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });

    test('should preserve alpha', () => {
      const result = HistogramEqualization.gammaCorrection(testPixels, 2.2);

      for (let i = 3; i < result.length; i += 4) {
        expect(result[i]).toBe(255);
      }
    });
  });

  describe('sigmoidContrast', () => {
    test('should apply sigmoid contrast', () => {
      const result = HistogramEqualization.sigmoidContrast(testPixels, 0.5);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should increase contrast with positive value', () => {
      const result = HistogramEqualization.sigmoidContrast(testPixels, 0.7);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should decrease contrast with negative value', () => {
      const result = HistogramEqualization.sigmoidContrast(testPixels, -0.7);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should be identity at 0', () => {
      const result = HistogramEqualization.sigmoidContrast(testPixels, 0);

      expect(result).toEqual(testPixels);
    });

    test('should throw error for invalid contrast', () => {
      expect(() => HistogramEqualization.sigmoidContrast(testPixels, 1.5)).toThrow();
      expect(() => HistogramEqualization.sigmoidContrast(testPixels, -1.5)).toThrow();
      expect(() => HistogramEqualization.sigmoidContrast(testPixels, 'invalid')).toThrow();
    });

    test('should clamp values to 0-255', () => {
      const result = HistogramEqualization.sigmoidContrast(testPixels, 0.9);

      for (let i = 0; i < result.length; i += 4) {
        expect(result[i]).toBeGreaterThanOrEqual(0);
        expect(result[i]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('helper methods', () => {
    test('getTileHistogram should return 256-bin histogram', () => {
      const histogram = HistogramEqualization.getTileHistogram(testPixels, width, 0, 0, width, height);

      expect(histogram).toBeInstanceOf(Uint32Array);
      expect(histogram.length).toBe(256);
    });

    test('clipHistogram should not exceed limit', () => {
      const histogram = new Uint32Array(256).fill(100);
      const originalSum = histogram.reduce((a, b) => a + b);

      HistogramEqualization.clipHistogram(histogram, 2.0);

      const clippedSum = histogram.reduce((a, b) => a + b);
      expect(clippedSum).toBeLessThanOrEqual(originalSum);
    });

    test('calculateLUT should produce 256-value lookup table', () => {
      const histogram = new Uint32Array(256).fill(10);
      const lut = HistogramEqualization.calculateLUT(histogram);

      expect(lut).toBeInstanceOf(Uint8ClampedArray);
      expect(lut.length).toBe(256);

      for (let i = 0; i < lut.length; i += 1) {
        expect(lut[i]).toBeGreaterThanOrEqual(0);
        expect(lut[i]).toBeLessThanOrEqual(255);
      }
    });
  });

  describe('edge cases', () => {
    test('should handle uniform image', () => {
      const uniform = new Uint8ClampedArray(width * height * 4).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const result = HistogramEqualization.equalize(uniform, width, height);
      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should handle extreme contrast', () => {
      const extreme = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < extreme.length; i += 8) {
        extreme[i] = 0;
        extreme[i + 4] = 255;
      }

      const result = HistogramEqualization.equalize(extreme, width, height);
      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should handle all zeros', () => {
      const black = new Uint8ClampedArray(width * height * 4);
      black.forEach((_, i) => {
        if (i % 4 === 3) black[i] = 255;
      });

      expect(() => HistogramEqualization.equalize(black, width, height)).not.toThrow();
    });

    test('should handle all 255', () => {
      const white = new Uint8ClampedArray(width * height * 4).fill(255);

      expect(() => HistogramEqualization.equalize(white, width, height)).not.toThrow();
    });
  });

  describe('composition', () => {
    test('should apply equalization then gamma', () => {
      const equalized = HistogramEqualization.equalize(testPixels, width, height);
      const corrected = HistogramEqualization.gammaCorrection(equalized, 1.8);

      expect(corrected).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should apply clahe then sigmoid', () => {
      const clahe = HistogramEqualization.clahe(testPixels, width, height);
      const sigmoid = HistogramEqualization.sigmoidContrast(clahe, 0.5);

      expect(sigmoid).toBeInstanceOf(Uint8ClampedArray);
    });
  });
});
