/**
 * Tests for utility functions
 * Tests core utility functions used across the TrashMap application
 */

import { 
  generateId, 
  isValidCoordinate, 
  calculateDistance, 
  formatFileSize,
  debounce 
} from '../src/utils';

describe('Utility Functions', () => {
  
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(10);
    });

    it('should include timestamp and random parts', () => {
      const id = generateId();
      expect(id).toMatch(/^\w+_\w+$/); // timestamp_random format
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(40.7128, -74.0060)).toBe(true); // NYC
      expect(isValidCoordinate(0, 0)).toBe(true); // Origin
      expect(isValidCoordinate(90, 180)).toBe(true); // Boundaries
      expect(isValidCoordinate(-90, -180)).toBe(true); // Boundaries
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(91, 0)).toBe(false); // Latitude too high
      expect(isValidCoordinate(-91, 0)).toBe(false); // Latitude too low
      expect(isValidCoordinate(0, 181)).toBe(false); // Longitude too high
      expect(isValidCoordinate(0, -181)).toBe(false); // Longitude too low
      expect(isValidCoordinate(NaN, 0)).toBe(false); // NaN values
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Distance between NYC and LA (approximately 3944 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBeCloseTo(0, 2);
    });

    it('should handle edge cases', () => {
      // Poles to equator
      const distance = calculateDistance(90, 0, 0, 0);
      expect(distance).toBeCloseTo(10007.5, 0); // Quarter of Earth's circumference
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatFileSize(2097152)).toBe('2 MB'); // 2 MB
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234)).toBe('1.21 KB');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls when called rapidly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      jest.advanceTimersByTime(50);
      debouncedFn('second');
      jest.advanceTimersByTime(50);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });
});
