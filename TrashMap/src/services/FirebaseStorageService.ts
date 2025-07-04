/**
 * Firebase Storage service for TrashMap MVP
 * Handles photo upload and storage operations
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const firestore = getFirestore(app);

export interface UploadResult {
  downloadURL: string;
  path: string;
  size: number;
}

/**
 * Firebase Storage Service
 */
export class FirebaseStorageService {
  /**
   * Upload photo to Firebase Storage
   */
  static async uploadPhoto(
    photoUri: string, 
    fileName: string, 
    folder: string = 'trash-photos'
  ): Promise<UploadResult> {
    try {
      // Convert URI to blob for upload
      const response = await fetch(photoUri);
      const blob = await response.blob();
      
      // Create storage reference
      const storageRef: StorageReference = ref(storage, `${folder}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        downloadURL,
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size
      };
    } catch (error) {
      console.error('[FirebaseStorageService] Upload failed:', error);
      throw new Error(`Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate unique filename for photo
   */
  static generateFileName(extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `photo_${timestamp}_${random}.${extension}`;
  }
}
