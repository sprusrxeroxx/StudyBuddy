/**
 * UploadPhotoCommand - Command pattern implementation
 * Handles the complete photo capture and upload flow for TrashMap MVP
 */

import * as ImagePicker from 'expo-image-picker';
import { ICommand } from './ICommand';
import { TrashReport, LocationCoordinate } from '../models';
import { EventBus, EVENTS, PhotoCapturedData, PhotoUploadData, ErrorData } from '../events';
import { FirebaseStorageService } from '../services/FirebaseStorageService';
import { LocationService } from '../services/LocationService';
import { generateId, isValidCoordinate } from '../utils';

export interface UploadPhotoOptions {
  useCamera?: boolean;
  allowsEditing?: boolean;
  quality?: number;
  forceLocation?: LocationCoordinate;
}

export interface UploadPhotoResult {
  trashReport: TrashReport;
  success: boolean;
  error?: string;
}

/**
 * Command to capture photo and upload to Firebase Storage
 * Implements Command pattern with EventBus integration
 */
export class UploadPhotoCommand implements ICommand<UploadPhotoResult> {
  private readonly options: UploadPhotoOptions;
  private photoId: string;

  constructor(options: UploadPhotoOptions = {}) {
    this.options = {
      useCamera: true,
      allowsEditing: false,
      quality: 0.8,
      ...options
    };
    this.photoId = generateId();
  }

  /**
   * Execute the photo capture and upload command
   */
  async execute(): Promise<UploadPhotoResult> {
    try {
      console.log(`[UploadPhotoCommand] Starting execution for photo ${this.photoId}`);

      // Step 1: Request camera permissions
      await this.requestCameraPermissions();

      // Step 2: Capture photo
      const imageResult = await this.capturePhoto();
      if (!imageResult || imageResult.canceled) {
        throw new Error('Photo capture was cancelled');
      }

      const photoUri = imageResult.assets[0].uri;
      console.log(`[UploadPhotoCommand] Photo captured: ${photoUri}`);

      // Step 3: Get location
      const location = await this.getLocation();

      // Step 4: Emit photo captured event
      const photoCapturedData: PhotoCapturedData = {
        uri: photoUri,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date()
      };
      EventBus.emitEvent(EVENTS.PHOTO_CAPTURED, photoCapturedData);

      // Step 5: Upload to Firebase Storage
      EventBus.emitEvent(EVENTS.PHOTO_UPLOAD_STARTED, { photoId: this.photoId });
      
      const fileName = FirebaseStorageService.generateFileName('jpg');
      const uploadResult = await FirebaseStorageService.uploadPhoto(photoUri, fileName);

      // Step 6: Create trash report
      const trashReport: TrashReport = {
        id: this.photoId,
        photoUri,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date(),
        isVerified: false,
        downloadURL: uploadResult.downloadURL
      };

      // Step 7: Emit success event
      const uploadData: PhotoUploadData = {
        photoId: this.photoId,
        downloadURL: uploadResult.downloadURL
      };
      EventBus.emitEvent(EVENTS.PHOTO_UPLOAD_SUCCESS, uploadData);

      console.log(`[UploadPhotoCommand] Upload successful for photo ${this.photoId}`);
      
      return {
        trashReport,
        success: true
      };

    } catch (error) {
      console.error(`[UploadPhotoCommand] Execution failed:`, error);
      
      // Emit error events
      const errorData: ErrorData = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'UPLOAD_PHOTO_FAILED',
        details: { photoId: this.photoId }
      };
      
      EventBus.emitEvent(EVENTS.ERROR_OCCURRED, errorData);
      EventBus.emitEvent(EVENTS.PHOTO_UPLOAD_FAILED, {
        photoId: this.photoId,
        error: errorData.message
      });

      return {
        trashReport: {} as TrashReport,
        success: false,
        error: errorData.message
      };
    }
  }

  /**
   * Request camera permissions
   */
  private async requestCameraPermissions(): Promise<void> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }
  }

  /**
   * Capture photo using ImagePicker
   */
  private async capturePhoto(): Promise<ImagePicker.ImagePickerResult> {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: this.options.allowsEditing,
      quality: this.options.quality,
      exif: true
    };

    if (this.options.useCamera) {
      return await ImagePicker.launchCameraAsync(options);
    } else {
      return await ImagePicker.launchImageLibraryAsync(options);
    }
  }

  /**
   * Get current location or use forced location
   */
  private async getLocation(): Promise<LocationCoordinate> {
    if (this.options.forceLocation) {
      if (!isValidCoordinate(this.options.forceLocation.latitude, this.options.forceLocation.longitude)) {
        throw new Error('Invalid forced location coordinates');
      }
      return this.options.forceLocation;
    }

    try {
      const locationData = await LocationService.getCurrentLocation();
      return {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp
      };
    } catch (error) {
      EventBus.emitEvent(EVENTS.LOCATION_PERMISSION_DENIED);
      throw new Error(`Location unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get command description for logging
   */
  getDescription(): string {
    return `Upload photo command for ID: ${this.photoId}`;
  }

  /**
   * Get the photo ID for this command
   */
  getPhotoId(): string {
    return this.photoId;
  }
}
