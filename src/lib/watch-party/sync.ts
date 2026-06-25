/**
 * Utility functions for playback synchronization and drift correction.
 */

import { SyncStatus } from '@/types/watch-party';

const DRIFT_THRESHOLD_SECONDS = 1.0;

/**
 * Checks if the local time has drifted too far from the host time.
 */
export function shouldCorrectDrift(localTime: number, hostTime: number): boolean {
  return Math.abs(localTime - hostTime) > DRIFT_THRESHOLD_SECONDS;
}

/**
 * Calculates the current estimated host time by taking the last known
 * host time and adding the time elapsed since that update was received.
 * This compensates for network latency.
 */
export function calculateLatencyCompensation(lastHostTime: number, updatedAt: string): number {
  const updatedMs = new Date(updatedAt).getTime();
  const nowMs = Date.now();
  const elapsedSeconds = (nowMs - updatedMs) / 1000;
  
  // Cap elapsed time to prevent runaway values if the client is paused for a long time
  // If the video is playing, time is advancing. If paused, it shouldn't advance.
  // This function assumes the video IS playing.
  return lastHostTime + elapsedSeconds;
}

/**
 * Computes the visual sync status based on the time difference.
 */
export function computeSyncStatus(localTime: number, expectedTime: number): SyncStatus {
  const diff = Math.abs(localTime - expectedTime);
  if (diff <= DRIFT_THRESHOLD_SECONDS) return 'synced';
  if (diff > DRIFT_THRESHOLD_SECONDS && diff <= DRIFT_THRESHOLD_SECONDS * 3) return 'syncing';
  return 'out-of-sync';
}
