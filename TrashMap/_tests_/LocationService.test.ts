/**
 * Tests for LocationService
 * Tests GPS location and permission management functionality
 */

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied'
  },
  Accuracy: {
    High: 6
  }
}));

import * as Location from 'expo-location';
import { LocationService } from '../src/services/LocationService';

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('requestPermissions', () => {
    it('should return granted status when permission is granted', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
        canAskAgain: true
      });

      const result = await LocationService.requestPermissions();

      expect(result).toEqual({
        granted: true,
        canAskAgain: true,
        status: Location.PermissionStatus.GRANTED
      });
    });

    it('should return denied status when permission is denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false
      });

      const result = await LocationService.requestPermissions();

      expect(result).toEqual({
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED
      });
    });

    it('should throw error when permission request fails', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission request failed')
      );

      await expect(LocationService.requestPermissions()).rejects.toThrow(
        'Location permission request failed: Permission request failed'
      );
    });
  });

  describe('getCurrentLocation', () => {
    const mockLocationData = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      },
      timestamp: 1625097600000 // July 1, 2021
    };

    beforeEach(() => {
      // Mock successful permission by default
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
        canAskAgain: true
      });
    });

    it('should return location data when successful', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocationData);

      const result = await LocationService.getCurrentLocation();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        timestamp: new Date(1625097600000)
      });

      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });
    });

    it('should handle missing accuracy', async () => {
      const locationWithoutAccuracy = {
        ...mockLocationData,
        coords: {
          ...mockLocationData.coords,
          accuracy: null
        }
      };

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(locationWithoutAccuracy);

      const result = await LocationService.getCurrentLocation();

      expect(result.accuracy).toBeUndefined();
    });

    it('should throw error when permission is denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false
      });

      await expect(LocationService.getCurrentLocation()).rejects.toThrow(
        'Failed to get location: Location permission not granted'
      );
    });

    it('should throw error when location request fails', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );

      await expect(LocationService.getCurrentLocation()).rejects.toThrow(
        'Failed to get location: Location unavailable'
      );
    });
  });

  describe('isLocationEnabled', () => {
    it('should return true when location services are enabled', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);

      const result = await LocationService.isLocationEnabled();

      expect(result).toBe(true);
    });

    it('should return false when location services are disabled', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

      const result = await LocationService.isLocationEnabled();

      expect(result).toBe(false);
    });

    it('should return false when service check fails', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockRejectedValue(
        new Error('Service check failed')
      );

      const result = await LocationService.isLocationEnabled();

      expect(result).toBe(false);
    });
  });
});
