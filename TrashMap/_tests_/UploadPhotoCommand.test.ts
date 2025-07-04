/**
 * Tests for UploadPhotoCommand
 * Tests the complete photo capture and upload flow
 */

// Mock Expo modules first, before any imports
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images'
  }
}));

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

import { UploadPhotoCommand } from '../src/commands/UploadPhotoCommand';
import { EventBus, EVENTS } from '../src/events';
import { FirebaseStorageService } from '../src/services/FirebaseStorageService';
import { LocationService } from '../src/services/LocationService';

// Mock dependencies
jest.mock('../src/services/FirebaseStorageService');
jest.mock('../src/services/LocationService');
jest.mock('../src/utils', () => ({
  generateId: jest.fn(() => 'test-photo-id'),
  isValidCoordinate: jest.fn(() => true),
}));

// Mock EventBus
jest.mock('../src/events/EventBus', () => ({
  emitEvent: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
}));

import * as ImagePicker from 'expo-image-picker';

describe('UploadPhotoCommand', () => {
  const mockPhotoUri = 'file://path/to/photo.jpg';
  const mockLocation = {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10,
    timestamp: new Date('2025-07-04T12:00:00Z')
  };
  const mockUploadResult = {
    downloadURL: 'https://firebase.com/download/url',
    path: 'trash-photos/photo.jpg',
    size: 1024
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset EventBus mock
    (EventBus.emitEvent as jest.Mock).mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const command = new UploadPhotoCommand();
      
      expect(command.getDescription()).toBe('Upload photo command for ID: test-photo-id');
      expect(command.getPhotoId()).toBe('test-photo-id');
    });

    it('should initialize with custom options', () => {
      const options = {
        useCamera: false,
        allowsEditing: true,
        quality: 0.5,
        forceLocation: mockLocation
      };
      
      const command = new UploadPhotoCommand(options);
      expect(command.getDescription()).toBe('Upload photo command for ID: test-photo-id');
    });
  });

  describe('execute - success flow', () => {
    beforeEach(() => {
      // Mock successful camera permission
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted'
      });

      // Mock successful photo capture
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockPhotoUri }]
      });

      // Mock successful location
      (LocationService.getCurrentLocation as jest.Mock).mockResolvedValue(mockLocation);

      // Mock successful upload
      (FirebaseStorageService.uploadPhoto as jest.Mock).mockResolvedValue(mockUploadResult);
      (FirebaseStorageService.generateFileName as jest.Mock).mockReturnValue('photo_123.jpg');
    });

    it('should execute complete upload flow successfully', async () => {
      const command = new UploadPhotoCommand();
      const result = await command.execute();

      expect(result.success).toBe(true);
      expect(result.trashReport).toEqual({
        id: 'test-photo-id',
        photoUri: mockPhotoUri,
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        timestamp: expect.any(Date),
        isVerified: false,
        downloadURL: mockUploadResult.downloadURL
      });
    });

    it('should emit correct events in sequence', async () => {
      const command = new UploadPhotoCommand();
      await command.execute();

      // Check event emissions in order
      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.PHOTO_CAPTURED, {
        uri: mockPhotoUri,
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        timestamp: expect.any(Date)
      });

      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.PHOTO_UPLOAD_STARTED, {
        photoId: 'test-photo-id'
      });

      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.PHOTO_UPLOAD_SUCCESS, {
        photoId: 'test-photo-id',
        downloadURL: mockUploadResult.downloadURL
      });
    });

    it('should request camera permissions', async () => {
      const command = new UploadPhotoCommand();
      await command.execute();

      expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('should capture photo with correct options', async () => {
      const command = new UploadPhotoCommand({
        useCamera: true,
        allowsEditing: true,
        quality: 0.9
      });
      
      await command.execute();

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        exif: true
      });
    });

    it('should use image library when useCamera is false', async () => {
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockPhotoUri }]
      });

      const command = new UploadPhotoCommand({ useCamera: false });
      await command.execute();

      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('should use forced location when provided', async () => {
      const forcedLocation = {
        latitude: 35.6762,
        longitude: 139.6503
      };

      const command = new UploadPhotoCommand({ forceLocation: forcedLocation });
      await command.execute();

      expect(LocationService.getCurrentLocation).not.toHaveBeenCalled();
      
      // Check that forced location was used in the result
      const result = await command.execute();
      expect(result.trashReport.latitude).toBe(forcedLocation.latitude);
      expect(result.trashReport.longitude).toBe(forcedLocation.longitude);
    });
  });

  describe('execute - error scenarios', () => {
    beforeEach(() => {
      // Mock successful camera permission by default
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted'
      });
    });

    it('should handle camera permission denied', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied'
      });

      const command = new UploadPhotoCommand();
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Camera permission not granted');
      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.ERROR_OCCURRED, expect.any(Object));
      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.PHOTO_UPLOAD_FAILED, {
        photoId: 'test-photo-id',
        error: 'Camera permission not granted'
      });
    });

    it('should handle photo capture cancellation', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: true
      });

      const command = new UploadPhotoCommand();
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Photo capture was cancelled');
    });

    it('should handle location service failure', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockPhotoUri }]
      });
      
      (LocationService.getCurrentLocation as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );

      const command = new UploadPhotoCommand();
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Location unavailable: Location unavailable');
      expect(EventBus.emitEvent).toHaveBeenCalledWith(EVENTS.LOCATION_PERMISSION_DENIED);
    });

    it('should handle Firebase upload failure', async () => {
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockPhotoUri }]
      });
      
      (LocationService.getCurrentLocation as jest.Mock).mockResolvedValue(mockLocation);
      
      (FirebaseStorageService.uploadPhoto as jest.Mock).mockRejectedValue(
        new Error('Upload failed')
      );

      const command = new UploadPhotoCommand();
      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });

    it('should handle invalid forced location coordinates', async () => {
      const { isValidCoordinate } = require('../src/utils');
      (isValidCoordinate as jest.Mock).mockReturnValue(false);

      const command = new UploadPhotoCommand({
        forceLocation: { latitude: 999, longitude: 999 }
      });

      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockPhotoUri }]
      });

      const result = await command.execute();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid forced location coordinates');
    });
  });

  describe('getters', () => {
    it('should return correct photo ID', () => {
      const command = new UploadPhotoCommand();
      expect(command.getPhotoId()).toBe('test-photo-id');
    });

    it('should return correct description', () => {
      const command = new UploadPhotoCommand();
      expect(command.getDescription()).toBe('Upload photo command for ID: test-photo-id');
    });
  });
});