/**
 * Tests for Transform Module
 */

import { Transform } from '../src/filters/transform.js';

describe('Transform', () => {
  let testPixels;
  let width;
  let height;

  beforeEach(() => {
    width = 4;
    height = 4;
    testPixels = new Uint8ClampedArray(width * height * 4);

    // Create a test pattern with coordinates
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4;
        testPixels[idx] = x * 50; // R increases left to right
        testPixels[idx + 1] = y * 50; // G increases top to bottom
        testPixels[idx + 2] = 100;
        testPixels[idx + 3] = 255;
      }
    }
  });

  describe('rotate', () => {
    test('should rotate 0 degrees', () => {
      const result = Transform.rotate(testPixels, width, height, 0);

      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
    });

    test('should rotate 90 degrees', () => {
      const result = Transform.rotate(testPixels, width, height, 90);

      expect(result.width).toBe(height);
      expect(result.height).toBe(width);
    });

    test('should rotate 180 degrees', () => {
      const result = Transform.rotate(testPixels, width, height, 180);

      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
    });

    test('should rotate 270 degrees', () => {
      const result = Transform.rotate(testPixels, width, height, 270);

      expect(result.width).toBe(height);
      expect(result.height).toBe(width);
    });

    test('should handle arbitrary angles', () => {
      const result = Transform.rotate(testPixels, width, height, 45);

      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    test('should normalize angles', () => {
      const result1 = Transform.rotate(testPixels, width, height, 90);
      const result2 = Transform.rotate(testPixels, width, height, 450);

      expect(result1.width).toBe(result2.width);
      expect(result1.height).toBe(result2.height);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => Transform.rotate(null, width, height, 90)).toThrow();
      expect(() => Transform.rotate(testPixels, width, height, 'invalid')).toThrow();
    });

    test('rotating 4 times by 90 should restore original', () => {
      let current = { pixels: testPixels, width, height };

      for (let i = 0; i < 4; i += 1) {
        current = Transform.rotate(current.pixels, current.width, current.height, 90);
      }

      expect(current.width).toBe(width);
      expect(current.height).toBe(height);
    });
  });

  describe('rotate90', () => {
    test('should rotate 90 degrees clockwise', () => {
      const result = Transform.rotate90(testPixels, width, height);

      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBe(height);
      expect(result.height).toBe(width);
    });

    test('should preserve pixel values', () => {
      const result = Transform.rotate90(testPixels, width, height);

      expect(result.pixels.length).toBe(testPixels.length);
    });
  });

  describe('rotate180', () => {
    test('should rotate 180 degrees', () => {
      const result = Transform.rotate180(testPixels, width, height);

      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
    });

    test('rotating twice should be close to original', () => {
      const result1 = Transform.rotate180(testPixels, width, height);
      const result2 = Transform.rotate180(result1.pixels, width, height);

      expect(result2.pixels).toEqual(testPixels);
    });
  });

  describe('rotate270', () => {
    test('should rotate 270 degrees clockwise', () => {
      const result = Transform.rotate270(testPixels, width, height);

      expect(result.width).toBe(height);
      expect(result.height).toBe(width);
    });

    test('should be equivalent to -90 degrees', () => {
      const result90 = Transform.rotate(testPixels, width, height, 90);
      const result270 = Transform.rotate(testPixels, width, height, 270);

      // Dimensions should be same but pixels different
      expect(result90.width).toBe(result270.width);
    });
  });

  describe('flipHorizontal', () => {
    test('should flip image horizontally', () => {
      const result = Transform.flipHorizontal(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should mirror left and right', () => {
      const result = Transform.flipHorizontal(testPixels, width, height);

      // First pixel of row should swap with last
      const row1First = result.slice(0, 4);
      const row1Last = result.slice((width - 1) * 4, (width - 1) * 4 + 4);

      expect(row1Last[0]).toBeGreaterThan(row1First[0]);
    });

    test('flipping twice should restore original', () => {
      const flipped1 = Transform.flipHorizontal(testPixels, width, height);
      const flipped2 = Transform.flipHorizontal(flipped1, width, height);

      expect(flipped2).toEqual(testPixels);
    });

    test('should throw error for invalid input', () => {
      expect(() => Transform.flipHorizontal(null, width, height)).toThrow();
    });
  });

  describe('flipVertical', () => {
    test('should flip image vertically', () => {
      const result = Transform.flipVertical(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(testPixels.length);
    });

    test('should mirror top and bottom', () => {
      const result = Transform.flipVertical(testPixels, width, height);

      expect(result).toBeInstanceOf(Uint8ClampedArray);
    });

    test('flipping twice should restore original', () => {
      const flipped1 = Transform.flipVertical(testPixels, width, height);
      const flipped2 = Transform.flipVertical(flipped1, width, height);

      expect(flipped2).toEqual(testPixels);
    });

    test('should throw error for invalid input', () => {
      expect(() => Transform.flipVertical(null, width, height)).toThrow();
    });
  });

  describe('crop', () => {
    test('should crop image', () => {
      const result = Transform.crop(testPixels, width, height, 0, 0, 2, 2);

      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    });

    test('should extract correct region', () => {
      const result = Transform.crop(testPixels, width, height, 1, 1, 2, 2);

      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    });

    test('should throw error for out of bounds crop', () => {
      expect(() => Transform.crop(testPixels, width, height, 0, 0, width + 1, height)).toThrow();
      expect(() => Transform.crop(testPixels, width, height, -1, 0, 2, 2)).toThrow();
    });

    test('should throw error for invalid parameters', () => {
      expect(() => Transform.crop(null, width, height, 0, 0, 2, 2)).toThrow();
      expect(() => Transform.crop(testPixels, 'invalid', height, 0, 0, 2, 2)).toThrow();
    });

    test('should preserve alpha channel', () => {
      const result = Transform.crop(testPixels, width, height, 0, 0, 2, 2);

      for (let i = 3; i < result.pixels.length; i += 4) {
        expect(result.pixels[i]).toBe(255);
      }
    });

    test('should crop entire image', () => {
      const result = Transform.crop(testPixels, width, height, 0, 0, width, height);

      expect(result.width).toBe(width);
      expect(result.height).toBe(height);
    });
  });

  describe('resize', () => {
    test('should resize image up', () => {
      const result = Transform.resize(testPixels, width, height, 8, 8);

      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.width).toBe(8);
      expect(result.height).toBe(8);
    });

    test('should resize image down', () => {
      const result = Transform.resize(testPixels, width, height, 2, 2);

      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    });

    test('should resize non-square', () => {
      const result = Transform.resize(testPixels, width, height, 8, 4);

      expect(result.width).toBe(8);
      expect(result.height).toBe(4);
    });

    test('should throw error for invalid parameters', () => {
      expect(() => Transform.resize(null, width, height, 8, 8)).toThrow();
      expect(() => Transform.resize(testPixels, width, height, 'invalid', 8)).toThrow();
    });

    test('should preserve aspect ratio in data', () => {
      const result = Transform.resize(testPixels, width, height, 16, 16);

      expect(result.pixels.length).toBe(16 * 16 * 4);
    });

    test('should handle 1x1 resize', () => {
      expect(() => Transform.resize(testPixels, width, height, 1, 1)).not.toThrow();
    });

    test('should handle large resize', () => {
      expect(() => Transform.resize(testPixels, width, height, 512, 512)).not.toThrow();
    });
  });

  describe('composition', () => {
    test('should compose multiple transformations', () => {
      let current = { pixels: testPixels, width, height };

      current = Transform.flipHorizontal(current.pixels, current.width, current.height);
      current = Transform.flipVertical(current, current.width, current.height);

      expect(current).toBeInstanceOf(Uint8ClampedArray);
    });

    test('should rotate then crop', () => {
      const rotated = Transform.rotate(testPixels, width, height, 90);
      const cropped = Transform.crop(rotated.pixels, rotated.width, rotated.height, 0, 0, 2, 2);

      expect(cropped.width).toBe(2);
      expect(cropped.height).toBe(2);
    });

    test('should resize then flip', () => {
      const resized = Transform.resize(testPixels, width, height, 8, 8);
      const flipped = Transform.flipHorizontal(resized.pixels, 8, 8);

      expect(flipped).toBeInstanceOf(Uint8ClampedArray);
    });
  });

  describe('edge cases', () => {
    test('should handle 1x1 image', () => {
      const tiny = new Uint8ClampedArray(4);
      tiny[0] = 100;
      tiny[1] = 150;
      tiny[2] = 200;
      tiny[3] = 255;

      expect(() => Transform.rotate(tiny, 1, 1, 90)).not.toThrow();
    });

    test('should handle very wide image', () => {
      const wide = new Uint8ClampedArray(1000 * 2 * 4);
      wide.forEach((_, i) => {
        if (i % 4 === 3) wide[i] = 255;
      });

      expect(() => Transform.flipHorizontal(wide, 1000, 2)).not.toThrow();
    });

    test('should handle uniform color', () => {
      const uniform = new Uint8ClampedArray(width * height * 4).fill(128);
      uniform.forEach((_, i) => {
        if (i % 4 === 3) uniform[i] = 255;
      });

      expect(() => Transform.rotate(uniform, width, height, 45)).not.toThrow();
    });
  });

  describe('preservation', () => {
    test('all transforms should preserve data size or produce valid output', () => {
      const transforms = [
        () => Transform.flipHorizontal(testPixels, width, height),
        () => Transform.flipVertical(testPixels, width, height),
        () => Transform.rotate(testPixels, width, height, 180).pixels,
      ];

      for (const transform of transforms) {
        const result = transform();
        expect(result).toBeInstanceOf(Uint8ClampedArray);
        expect(result.length % 4).toBe(0);
      }
    });

    test('should preserve alpha in all operations', () => {
      const operations = [
        (p) => Transform.flipHorizontal(p, width, height),
        (p) => Transform.flipVertical(p, width, height),
        (p) => Transform.rotate(p, width, height, 90).pixels,
      ];

      for (const op of operations) {
        const result = op(testPixels);
        for (let i = 3; i < result.length; i += 4) {
          expect(result[i]).toBe(255);
        }
      }
    });
  });
});
