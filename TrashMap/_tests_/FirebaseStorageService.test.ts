/**
 * Tests for FirebaseStorageService
 * Tests photo upload functionality and file name generation
 */

import { FirebaseStorageService } from '../src/services/FirebaseStorageService';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

// Mock fetch for blob conversion
global.fetch = jest.fn();

describe('FirebaseStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateFileName', () => {
    it('should generate unique filename with default jpg extension', () => {
      const fileName1 = FirebaseStorageService.generateFileName();
      const fileName2 = FirebaseStorageService.generateFileName();
      
      expect(fileName1).toMatch(/^photo_\w+_\w+\.jpg$/);
      expect(fileName2).toMatch(/^photo_\w+_\w+\.jpg$/);
      expect(fileName1).not.toBe(fileName2); // Should be unique
    });

    it('should generate filename with custom extension', () => {
      const fileName = FirebaseStorageService.generateFileName('png');
      expect(fileName).toMatch(/^photo_\w+_\w+\.png$/);
    });

    it('should include timestamp in filename', () => {
      const fileName = FirebaseStorageService.generateFileName();
      
      // Check that filename contains timestamp-like pattern
      // Format: photo_<timestamp_base36>_<random>.jpg
      const match = fileName.match(/^photo_(\w+)_\w+\.jpg$/);
      expect(match).toBeTruthy();
      
      const timestampPart = match![1];
      // Just verify it's a valid base36 string (alphanumeric)
      expect(timestampPart).toMatch(/^[a-z0-9]+$/);
      expect(timestampPart.length).toBeGreaterThan(5); // Reasonable length for timestamp
    });
  });

  describe('uploadPhoto', () => {
    const mockPhotoUri = 'file://path/to/photo.jpg';
    const mockFileName = 'test-photo.jpg';
    const mockBlob = new Blob(['mock-data'], { type: 'image/jpeg' });
    const mockDownloadURL = 'https://firebase.com/download/url';
    const mockSnapshot = {
      ref: {
        fullPath: 'trash-photos/test-photo.jpg'
      },
      metadata: {
        size: 1024
      }
    };

    beforeEach(() => {
      // Mock fetch to return blob
      (global.fetch as jest.Mock).mockResolvedValue({
        blob: () => Promise.resolve(mockBlob)
      });

      // Mock Firebase storage functions
      const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
      ref.mockReturnValue('mock-ref');
      uploadBytes.mockResolvedValue(mockSnapshot);
      getDownloadURL.mockResolvedValue(mockDownloadURL);
    });

    it('should successfully upload photo and return download URL', async () => {
      const result = await FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName);

      expect(result).toEqual({
        downloadURL: mockDownloadURL,
        path: 'trash-photos/test-photo.jpg',
        size: 1024
      });
    });

    it('should use correct storage path with default folder', async () => {
      const { ref } = require('firebase/storage');
      
      await FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName);
      
      expect(ref).toHaveBeenCalledWith({}, 'trash-photos/test-photo.jpg');
    });

    it('should use custom folder when provided', async () => {
      const { ref } = require('firebase/storage');
      const customFolder = 'custom-folder';
      
      await FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName, customFolder);
      
      expect(ref).toHaveBeenCalledWith({}, 'custom-folder/test-photo.jpg');
    });

    it('should convert photo URI to blob before upload', async () => {
      const { uploadBytes } = require('firebase/storage');
      
      await FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName);
      
      expect(global.fetch).toHaveBeenCalledWith(mockPhotoUri);
      expect(uploadBytes).toHaveBeenCalledWith('mock-ref', mockBlob);
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(
        FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName)
      ).rejects.toThrow('Photo upload failed: Fetch failed');
    });

    it('should throw error when upload fails', async () => {
      const { uploadBytes } = require('firebase/storage');
      uploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(
        FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName)
      ).rejects.toThrow('Photo upload failed: Upload failed');
    });

    it('should throw error when getting download URL fails', async () => {
      const { getDownloadURL } = require('firebase/storage');
      getDownloadURL.mockRejectedValue(new Error('Download URL failed'));

      await expect(
        FirebaseStorageService.uploadPhoto(mockPhotoUri, mockFileName)
      ).rejects.toThrow('Photo upload failed: Download URL failed');
    });
  });
});