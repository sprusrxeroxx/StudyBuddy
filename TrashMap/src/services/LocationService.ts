/**
 * Location Service for TrashMap MVP
 * Handles GPS location and permission management
 */

import * as Location from 'expo-location';
import { LocationData } from '../events';

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

/**
 * Location Service using Expo Location
 */
export class LocationService {
  /**
   * Request location permissions
   */
  static async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      return {
        granted: status === Location.PermissionStatus.GRANTED,
        canAskAgain,
        status
      };
    } catch (error) {
      console.error('[LocationService] Permission request failed:', error);
      throw new Error(`Location permission request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current location
   */
  static async getCurrentLocation(): Promise<LocationData> {
    try {
      // Check permissions first
      const permission = await this.requestPermissions();
      if (!permission.granted) {
        throw new Error('Location permission not granted');
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date(location.timestamp)
      };
    } catch (error) {
      console.error('[LocationService] Get location failed:', error);
      throw new Error(`Failed to get location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('[LocationService] Service check failed:', error);
      return false;
    }
  }
}
