/**
 * Data models for TrashMap MVP
 * TypeScript interfaces for core domain objects
 */

export interface TrashReport {
  id: string;
  photoUri: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  isVerified: boolean;
  confidence?: number;
  category?: string;
  downloadURL?: string;
  userId?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlockedAt: Date;
}

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface PhotoMetadata {
  width: number;
  height: number;
  size: number;
  mimeType: string;
  fileName?: string;
}
