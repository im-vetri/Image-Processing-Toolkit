/**
 * Tests for QualityMetrics Module
 */

import { QualityMetrics } from '../src/filters/qualityMetrics.js';

describe('QualityMetrics', () => {
  let original;
  let compressed;
  let width;
  let height;

  beforeEach(() => {
    width = 8;
    height = 8;
    original = new Uint8ClampedArray(width * height * 4);
    compressed = new Uint8ClampedArray(width * height * 4);

    // Fill original with test pattern
    for (let i = 0; i < original.length; i += 4) {
      original[i] = 100;
      original[i + 1] = 150;
      original[i + 2] = 200;
      original[i + 3] = 255;
    }

    // Fill compressed with slightly different data
    for (let i = 0; i < compressed.length; i += 4) {
      compressed[i] = 95;
      compressed[i + 1] = 145;
      compressed[i + 2] = 205;
      compressed[i + 3] = 255;
    }
  });

  describe('psnr', () => {
    test('should calculate PSNR', () => {
      const psnr = QualityMetrics.psnr(original, compressed);

      expect(typeof psnr).toBe('number');
      expect(psnr).toBeGreaterThan(0);
    });

    test('should return 100 for identical images', () => {
      const identical = new Uint8ClampedArray(original);
      const psnr = QualityMetrics.psnr(original, identical);

      expect(psnr).toBe(100);
    });

    test('should throw error for different lengths', () => {
      const wrongLength = new Uint8ClampedArray(10);
      expect(() => QualityMetrics.psnr(original, wrongLength)).toThrow();
    });

    test('should throw error for null input', () => {
      expect(() => QualityMetrics.psnr(null, compressed)).toThrow();
      expect(() => QualityMetrics.psnr(original, null)).toThrow();
    });

    test('should be consistent', () => {
      const psnr1 = QualityMetrics.psnr(original, compressed);
      const psnr2 = QualityMetrics.psnr(original, compressed);

      expect(psnr1).toBe(psnr2);
    });

    test('should increase with better compression', () => {
      const worse = new Uint8ClampedArray(original.length);
      const better = new Uint8ClampedArray(original.length);

      for (let i = 0; i < original.length; i += 4) {
        worse[i] = 50;
        worse[i + 1] = 50;
        worse[i + 2] = 50;
        worse[i + 3] = 255;

        better[i] = 99;
        better[i + 1] = 149;
        better[i + 2] = 199;
        better[i + 3] = 255;
      }

      const psnrWorse = QualityMetrics.psnr(original, worse);
      const psnrBetter = QualityMetrics.psnr(original, better);

      expect(psnrBetter).toBeGreaterThan(psnrWorse);
    });
  });

  describe('ssim', () => {
    test('should calculate SSIM', () => {
      const ssim = QualityMetrics.ssim(original, compressed, width, height);

      expect(typeof ssim).toBe('number');
      expect(ssim).toBeGreaterThanOrEqual(0);
      expect(ssim).toBeLessThanOrEqual(1);
    });

    test('should return 1 for identical images', () => {
      const identical = new Uint8ClampedArray(original);
      const ssim = QualityMetrics.ssim(original, identical, width, height);

      expect(ssim).toBe(1);
    });

    test('should accept custom window size', () => {
      const ssim = QualityMetrics.ssim(original, compressed, width, height, 5);

      expect(typeof ssim).toBe('number');
    });

    test('should throw error for invalid parameters', () => {
      expect(() => QualityMetrics.ssim(null, compressed, width, height)).toThrow();
      expect(() => QualityMetrics.ssim(original, null, width, height)).toThrow();
    });

    test('should throw error for length mismatch', () => {
      const wrongLength = new Uint8ClampedArray(10);
      expect(() => QualityMetrics.ssim(original, wrongLength, width, height)).toThrow();
    });

    test('should be consistent', () => {
      const ssim1 = QualityMetrics.ssim(original, compressed, width, height);
      const ssim2 = QualityMetrics.ssim(original, compressed, width, height);

      expect(ssim1).toBe(ssim2);
    });
  });

  describe('mse', () => {
    test('should calculate MSE', () => {
      const mse = QualityMetrics.mse(original, compressed);

      expect(typeof mse).toBe('number');
      expect(mse).toBeGreaterThanOrEqual(0);
    });

    test('should be 0 for identical images', () => {
      const identical = new Uint8ClampedArray(original);
      const mse = QualityMetrics.mse(original, identical);

      expect(mse).toBe(0);
    });

    test('should throw error for different lengths', () => {
      const wrongLength = new Uint8ClampedArray(10);
      expect(() => QualityMetrics.mse(original, wrongLength)).toThrow();
    });

    test('should increase with worse compression', () => {
      const small = new Uint8ClampedArray(original.length);
      const large = new Uint8ClampedArray(original.length);

      for (let i = 0; i < original.length; i += 4) {
        small[i] = 101;
        small[i + 1] = 151;
        small[i + 2] = 201;
        small[i + 3] = 255;

        large[i] = 50;
        large[i + 1] = 50;
        large[i + 2] = 50;
        large[i + 3] = 255;
      }

      const mseSmall = QualityMetrics.mse(original, small);
      const mseLarge = QualityMetrics.mse(original, large);

      expect(mseLarge).toBeGreaterThan(mseSmall);
    });
  });

  describe('sharpness', () => {
    test('should calculate sharpness', () => {
      const sharpness = QualityMetrics.sharpness(original, width, height);

      expect(typeof sharpness).toBe('number');
      expect(sharpness).toBeGreaterThanOrEqual(0);
      expect(sharpness).toBeLessThanOrEqual(100);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => QualityMetrics.sharpness(null, width, height)).toThrow();
      expect(() => QualityMetrics.sharpness(original, 'invalid', height)).toThrow();
    });

    test('blurred image should have lower sharpness', () => {
      const sharp = new Uint8ClampedArray(width * height * 4);
      const blurred = new Uint8ClampedArray(width * height * 4);

      // Create sharp edges
      for (let i = 0; i < sharp.length; i += 4) {
        if (i % 64 < 32) {
          sharp[i] = 0;
          sharp[i + 1] = 0;
          sharp[i + 2] = 0;
        } else {
          sharp[i] = 255;
          sharp[i + 1] = 255;
          sharp[i + 2] = 255;
        }
        sharp[i + 3] = 255;
      }

      // Create blurred version
      for (let i = 0; i < blurred.length; i += 4) {
        blurred[i] = 128;
        blurred[i + 1] = 128;
        blurred[i + 2] = 128;
        blurred[i + 3] = 255;
      }

      const sharpScore = QualityMetrics.sharpness(sharp, width, height);
      const blurredScore = QualityMetrics.sharpness(blurred, width, height);

      expect(sharpScore).toBeGreaterThan(blurredScore);
    });
  });

  describe('contrast', () => {
    test('should calculate contrast', () => {
      const contrast = QualityMetrics.contrast(original);

      expect(typeof contrast).toBe('number');
      expect(contrast).toBeGreaterThanOrEqual(0);
      expect(contrast).toBeLessThanOrEqual(1);
    });

    test('should throw error for null input', () => {
      expect(() => QualityMetrics.contrast(null)).toThrow();
    });

    test('uniform image should have zero contrast', () => {
      const uniform = new Uint8ClampedArray(original.length).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const contrast = QualityMetrics.contrast(uniform);
      expect(contrast).toBe(0);
    });

    test('extreme contrast should approach 1', () => {
      const extreme = new Uint8ClampedArray(original.length);
      for (let i = 0; i < extreme.length; i += 8) {
        extreme[i] = 0;
        extreme[i + 4] = 255;
      }

      const contrast = QualityMetrics.contrast(extreme);
      expect(contrast).toBeGreaterThan(0.5);
    });
  });

  describe('brightness', () => {
    test('should calculate brightness', () => {
      const brightness = QualityMetrics.brightness(original);

      expect(typeof brightness).toBe('number');
      expect(brightness).toBeGreaterThanOrEqual(0);
      expect(brightness).toBeLessThanOrEqual(255);
    });

    test('should throw error for null input', () => {
      expect(() => QualityMetrics.brightness(null)).toThrow();
    });

    test('dark image should have low brightness', () => {
      const dark = new Uint8ClampedArray(original.length).fill(50);
      dark.forEach((_, i) => {
        if (i % 4 === 3) dark[i] = 255;
      });

      const bright = new Uint8ClampedArray(original.length).fill(200);
      bright.forEach((_, i) => {
        if (i % 4 === 3) bright[i] = 255;
      });

      const darkScore = QualityMetrics.brightness(dark);
      const brightScore = QualityMetrics.brightness(bright);

      expect(brightScore).toBeGreaterThan(darkScore);
    });
  });

  describe('entropy', () => {
    test('should calculate entropy', () => {
      const entropy = QualityMetrics.entropy(original);

      expect(typeof entropy).toBe('number');
      expect(entropy).toBeGreaterThanOrEqual(0);
      expect(entropy).toBeLessThanOrEqual(8);
    });

    test('should throw error for null input', () => {
      expect(() => QualityMetrics.entropy(null)).toThrow();
    });

    test('uniform image should have zero entropy', () => {
      const uniform = new Uint8ClampedArray(original.length).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const entropy = QualityMetrics.entropy(uniform);
      expect(entropy).toBe(0);
    });

    test('diverse image should have higher entropy', () => {
      const uniform = new Uint8ClampedArray(width * height * 4).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      const diverse = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < diverse.length; i += 4) {
        diverse[i] = (i / 4) % 256;
        diverse[i + 1] = ((i / 4) * 2) % 256;
        diverse[i + 2] = ((i / 4) * 3) % 256;
        diverse[i + 3] = 255;
      }

      const uniformEntropy = QualityMetrics.entropy(uniform);
      const diverseEntropy = QualityMetrics.entropy(diverse);

      expect(diverseEntropy).toBeGreaterThan(uniformEntropy);
    });
  });

  describe('compare', () => {
    test('should return comprehensive metrics', () => {
      const report = QualityMetrics.compare(original, compressed, width, height);

      expect(report).toHaveProperty('psnr');
      expect(report).toHaveProperty('ssim');
      expect(report).toHaveProperty('mse');
      expect(report).toHaveProperty('originalSharpness');
      expect(report).toHaveProperty('compressedSharpness');
      expect(report).toHaveProperty('originalContrast');
      expect(report).toHaveProperty('compressedContrast');
      expect(report).toHaveProperty('originalBrightness');
      expect(report).toHaveProperty('compressedBrightness');
      expect(report).toHaveProperty('originalEntropy');
      expect(report).toHaveProperty('compressedEntropy');
    });

    test('should throw error for mismatched data', () => {
      const wrongLength = new Uint8ClampedArray(10);
      expect(() => QualityMetrics.compare(original, wrongLength, width, height)).toThrow();
    });

    test('identical images should have perfect scores', () => {
      const report = QualityMetrics.compare(original, original, width, height);

      expect(report.psnr).toBe(100);
      expect(report.ssim).toBe(1);
      expect(report.mse).toBe(0);
    });

    test('should calculate all metrics', () => {
      const report = QualityMetrics.compare(original, compressed, width, height);

      expect(typeof report.psnr).toBe('number');
      expect(typeof report.ssim).toBe('number');
      expect(typeof report.mse).toBe('number');
      expect(typeof report.originalSharpness).toBe('number');
      expect(typeof report.compressedSharpness).toBe('number');
    });
  });

  describe('window stats helper', () => {
    test('should calculate window statistics', () => {
      const stats = QualityMetrics.getWindowStats(original, compressed, width, 1, 1, 5, 4);

      expect(stats).toHaveProperty('muX2');
      expect(stats).toHaveProperty('muY2');
      expect(stats).toHaveProperty('sigmaX2');
      expect(stats).toHaveProperty('sigmaY2');
      expect(stats).toHaveProperty('sigmaXY');
    });
  });

  describe('metric validation', () => {
    test('all metrics should be non-negative', () => {
      const metrics = {
        psnr: QualityMetrics.psnr(original, compressed),
        mse: QualityMetrics.mse(original, compressed),
        sharpness: QualityMetrics.sharpness(original, width, height),
        contrast: QualityMetrics.contrast(original),
        brightness: QualityMetrics.brightness(original),
        entropy: QualityMetrics.entropy(original),
      };

      Object.values(metrics).forEach((metric) => {
        expect(metric).toBeGreaterThanOrEqual(0);
      });
    });

    test('SSIM should be between 0 and 1', () => {
      const ssim = QualityMetrics.ssim(original, compressed, width, height);
      expect(ssim).toBeGreaterThanOrEqual(0);
      expect(ssim).toBeLessThanOrEqual(1);
    });

    test('all metrics should be finite', () => {
      const metrics = {
        psnr: QualityMetrics.psnr(original, compressed),
        mse: QualityMetrics.mse(original, compressed),
        sharpness: QualityMetrics.sharpness(original, width, height),
        contrast: QualityMetrics.contrast(original),
        brightness: QualityMetrics.brightness(original),
        entropy: QualityMetrics.entropy(original),
      };

      Object.values(metrics).forEach((metric) => {
        expect(Number.isFinite(metric)).toBe(true);
      });
    });
  });
});
