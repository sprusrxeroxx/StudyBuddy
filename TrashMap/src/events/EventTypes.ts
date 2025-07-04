/**
 * Application-wide event types for TrashMap MVP
 * Defines events for the four core flows: Capture → Verify → Visualize → Score
 */

// Core event names as constants
export const EVENTS = {
  // Photo Capture Flow
  PHOTO_CAPTURED: 'photo:captured',
  PHOTO_UPLOAD_STARTED: 'photo:upload:started',
  PHOTO_UPLOAD_SUCCESS: 'photo:upload:success',
  PHOTO_UPLOAD_FAILED: 'photo:upload:failed',
  
  // AI Verification Flow
  VERIFICATION_STARTED: 'verification:started',
  VERIFICATION_SUCCESS: 'verification:success',
  VERIFICATION_FAILED: 'verification:failed',
  
  // Map Visualization Flow
  MAP_DATA_UPDATED: 'map:data:updated',
  HEATMAP_REFRESH: 'map:heatmap:refresh',
  
  // Scoring & Gamification Flow
  POINTS_AWARDED: 'score:points:awarded',
  LEADERBOARD_UPDATED: 'score:leaderboard:updated',
  ACHIEVEMENT_UNLOCKED: 'score:achievement:unlocked',
  
  // Location Events
  LOCATION_UPDATED: 'location:updated',
  LOCATION_PERMISSION_DENIED: 'location:permission:denied',
  
  // Error Events
  ERROR_OCCURRED: 'error:occurred',
} as const;

// Event data types
export interface PhotoCapturedData {
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface PhotoUploadData {
  photoId: string;
  downloadURL?: string;
  error?: string;
}

export interface VerificationData {
  photoId: string;
  isTrash: boolean;
  confidence: number;
  categories?: string[];
  error?: string;
}

export interface MapDataUpdate {
  trashPoints: TrashPoint[];
  centerCoordinate?: {
    latitude: number;
    longitude: number;
  };
}

export interface TrashPoint {
  id: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  category?: string;
  timestamp: Date;
}

export interface PointsAwardedData {
  points: number;
  reason: string;
  totalPoints: number;
  userId: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface ErrorData {
  message: string;
  code?: string;
  details?: any;
}

// Type helper for event data mapping
export type EventDataMap = {
  [EVENTS.PHOTO_CAPTURED]: PhotoCapturedData;
  [EVENTS.PHOTO_UPLOAD_STARTED]: { photoId: string };
  [EVENTS.PHOTO_UPLOAD_SUCCESS]: PhotoUploadData;
  [EVENTS.PHOTO_UPLOAD_FAILED]: PhotoUploadData;
  [EVENTS.VERIFICATION_STARTED]: { photoId: string };
  [EVENTS.VERIFICATION_SUCCESS]: VerificationData;
  [EVENTS.VERIFICATION_FAILED]: VerificationData;
  [EVENTS.MAP_DATA_UPDATED]: MapDataUpdate;
  [EVENTS.HEATMAP_REFRESH]: void;
  [EVENTS.POINTS_AWARDED]: PointsAwardedData;
  [EVENTS.LEADERBOARD_UPDATED]: void;
  [EVENTS.ACHIEVEMENT_UNLOCKED]: { achievement: string; points: number };
  [EVENTS.LOCATION_UPDATED]: LocationData;
  [EVENTS.LOCATION_PERMISSION_DENIED]: void;
  [EVENTS.ERROR_OCCURRED]: ErrorData;
};
