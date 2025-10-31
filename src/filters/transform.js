/**
 * Transform Module - PR #5
 * Image transformation operations: Rotation, Flip, Crop
 */

/**
 * Transform class for image geometric operations
 * @class
 */
export class Transform {
  /**
   * Rotate image by specified angle
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} angle - Rotation angle in degrees (clockwise)
   * @returns {object} Rotated pixels and new dimensions
   */
  static rotate(pixels, width, height, angle) {
    if (!pixels || typeof angle !== 'number') {
      throw new Error('Invalid rotation parameters');
    }

    // Normalize angle
    const normalizedAngle = ((angle % 360) + 360) % 360;

    // Handle 90-degree rotations efficiently
    if (normalizedAngle === 90) {
      return Transform.rotate90(pixels, width, height);
    }
    if (normalizedAngle === 180) {
      return Transform.rotate180(pixels, width, height);
    }
    if (normalizedAngle === 270) {
      return Transform.rotate270(pixels, width, height);
    }

    return Transform.rotateArbitrary(pixels, width, height, normalizedAngle);
  }

  /**
   * Rotate 90 degrees clockwise
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object} Rotated pixels and dimensions
   */
  static rotate90(pixels, width, height) {
    const newWidth = height;
    const newHeight = width;
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const oldIdx = (y * width + x) * channels;
        const newX = height - 1 - y;
        const newY = x;
        const newIdx = (newY * newWidth + newX) * channels;

        result[newIdx] = pixels[oldIdx];
        result[newIdx + 1] = pixels[oldIdx + 1];
        result[newIdx + 2] = pixels[oldIdx + 2];
        result[newIdx + 3] = pixels[oldIdx + 3];
      }
    }

    return { pixels: result, width: newWidth, height: newHeight };
  }

  /**
   * Rotate 180 degrees
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object} Rotated pixels and dimensions
   */
  static rotate180(pixels, width, height) {
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;
    const total = width * height;

    for (let i = 0; i < total; i += 1) {
      const oldIdx = i * channels;
      const newIdx = (total - 1 - i) * channels;

      result[newIdx] = pixels[oldIdx];
      result[newIdx + 1] = pixels[oldIdx + 1];
      result[newIdx + 2] = pixels[oldIdx + 2];
      result[newIdx + 3] = pixels[oldIdx + 3];
    }

    return { pixels: result, width, height };
  }

  /**
   * Rotate 270 degrees clockwise (90 counter-clockwise)
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {object} Rotated pixels and dimensions
   */
  static rotate270(pixels, width, height) {
    const newWidth = height;
    const newHeight = width;
    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const oldIdx = (y * width + x) * channels;
        const newX = y;
        const newY = width - 1 - x;
        const newIdx = (newY * newWidth + newX) * channels;

        result[newIdx] = pixels[oldIdx];
        result[newIdx + 1] = pixels[oldIdx + 1];
        result[newIdx + 2] = pixels[oldIdx + 2];
        result[newIdx + 3] = pixels[oldIdx + 3];
      }
    }

    return { pixels: result, width: newWidth, height: newHeight };
  }

  /**
   * Rotate by arbitrary angle
   * @private
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} angle - Rotation angle in degrees
   * @returns {object} Rotated pixels and dimensions
   */
  static rotateArbitrary(pixels, width, height, angle) {
    const radian = (angle * Math.PI) / 180;
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);

    const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
    const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));
    const result = new Uint8ClampedArray(newWidth * newHeight * 4);
    const channels = 4;

    const cx = width / 2;
    const cy = height / 2;
    const ncx = newWidth / 2;
    const ncy = newHeight / 2;

    for (let y = 0; y < newHeight; y += 1) {
      for (let x = 0; x < newWidth; x += 1) {
        const dx = x - ncx;
        const dy = y - ncy;

        const srcX = Math.round(dx * cos + dy * sin + cx);
        const srcY = Math.round(-dx * sin + dy * cos + cy);

        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * channels;
          const dstIdx = (y * newWidth + x) * channels;

          result[dstIdx] = pixels[srcIdx];
          result[dstIdx + 1] = pixels[srcIdx + 1];
          result[dstIdx + 2] = pixels[srcIdx + 2];
          result[dstIdx + 3] = pixels[srcIdx + 3];
        }
      }
    }

    return { pixels: result, width: newWidth, height: newHeight };
  }

  /**
   * Flip image horizontally
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Flipped pixels
   */
  static flipHorizontal(pixels, width, height) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const oldIdx = (y * width + x) * channels;
        const newIdx = (y * width + (width - 1 - x)) * channels;

        result[newIdx] = pixels[oldIdx];
        result[newIdx + 1] = pixels[oldIdx + 1];
        result[newIdx + 2] = pixels[oldIdx + 2];
        result[newIdx + 3] = pixels[oldIdx + 3];
      }
    }

    return result;
  }

  /**
   * Flip image vertically
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Uint8ClampedArray} Flipped pixels
   */
  static flipVertical(pixels, width, height) {
    if (!pixels) {
      throw new Error('Invalid pixels');
    }

    const result = new Uint8ClampedArray(pixels.length);
    const channels = 4;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const oldIdx = (y * width + x) * channels;
        const newIdx = ((height - 1 - y) * width + x) * channels;

        result[newIdx] = pixels[oldIdx];
        result[newIdx + 1] = pixels[oldIdx + 1];
        result[newIdx + 2] = pixels[oldIdx + 2];
        result[newIdx + 3] = pixels[oldIdx + 3];
      }
    }

    return result;
  }

  /**
   * Crop image to specified region
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} x - Top-left X coordinate
   * @param {number} y - Top-left Y coordinate
   * @param {number} cropWidth - Crop width
   * @param {number} cropHeight - Crop height
   * @returns {object} Cropped pixels and dimensions
   */
  static crop(pixels, width, height, x, y, cropWidth, cropHeight) {
    if (!pixels || typeof x !== 'number' || typeof y !== 'number'
        || typeof cropWidth !== 'number' || typeof cropHeight !== 'number') {
      throw new Error('Invalid crop parameters');
    }

    if (x < 0 || y < 0 || x + cropWidth > width || y + cropHeight > height) {
      throw new Error('Crop region exceeds image boundaries');
    }

    const result = new Uint8ClampedArray(cropWidth * cropHeight * 4);
    const channels = 4;

    for (let cy = 0; cy < cropHeight; cy += 1) {
      for (let cx = 0; cx < cropWidth; cx += 1) {
        const srcIdx = ((y + cy) * width + (x + cx)) * channels;
        const dstIdx = (cy * cropWidth + cx) * channels;

        result[dstIdx] = pixels[srcIdx];
        result[dstIdx + 1] = pixels[srcIdx + 1];
        result[dstIdx + 2] = pixels[srcIdx + 2];
        result[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }

    return { pixels: result, width: cropWidth, height: cropHeight };
  }

  /**
   * Resize image using nearest neighbor
   * @param {Uint8ClampedArray} pixels - Pixel data
   * @param {number} width - Original width
   * @param {number} height - Original height
   * @param {number} newWidth - Target width
   * @param {number} newHeight - Target height
   * @returns {object} Resized pixels and dimensions
   */
  static resize(pixels, width, height, newWidth, newHeight) {
    if (!pixels || typeof newWidth !== 'number' || typeof newHeight !== 'number') {
      throw new Error('Invalid resize parameters');
    }

    const result = new Uint8ClampedArray(newWidth * newHeight * 4);
    const channels = 4;
    const xRatio = width / newWidth;
    const yRatio = height / newHeight;

    for (let y = 0; y < newHeight; y += 1) {
      for (let x = 0; x < newWidth; x += 1) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        const srcIdx = (srcY * width + srcX) * channels;
        const dstIdx = (y * newWidth + x) * channels;

        result[dstIdx] = pixels[srcIdx];
        result[dstIdx + 1] = pixels[srcIdx + 1];
        result[dstIdx + 2] = pixels[srcIdx + 2];
        result[dstIdx + 3] = pixels[srcIdx + 3];
      }
    }

    return { pixels: result, width: newWidth, height: newHeight };
  }
}
