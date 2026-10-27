import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { GolfClub } from '../models/golf-club.model';

const STORAGE_KEY = 'golf-caddie.club-bag.v1';

const SAMPLE_BAG: GolfClub[] = [
  { id: 'sample-driver', name: 'Driver', loftDegrees: 10.5, carryDistanceYards: 220, distanceSource: 'estimated', active: true, typicalMiss: 'right' },
  { id: 'sample-5-wood', name: '5 Wood', loftDegrees: 18, carryDistanceYards: 190, distanceSource: 'estimated', active: true },
  { id: 'sample-7-iron', name: '7 Iron', loftDegrees: 30, carryDistanceYards: 145, distanceSource: 'estimated', active: true },
  { id: 'sample-9-iron', name: '9 Iron', loftDegrees: 42, carryDistanceYards: 120, distanceSource: 'estimated', active: true },
  { id: 'sample-pw', name: 'Pitching Wedge', loftDegrees: 46, carryDistanceYards: 105, distanceSource: 'estimated', active: true },
  { id: 'sample-sw', name: 'Sand Wedge', loftDegrees: 56, carryDistanceYards: 75, distanceSource: 'estimated', active: true },
];

@Injectable({ providedIn: 'root' })
export class BagStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  getBag(): GolfClub[] {
    const storage = this.getStorage();
    if (!storage) return this.copySampleBag();

    try {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved === null) return this.copySampleBag();

      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.every(isGolfClub) ? parsed : this.copySampleBag();
    } catch {
      return this.copySampleBag();
    }
  }

  saveBag(bag: GolfClub[]): void {
    try {
      this.getStorage()?.setItem(STORAGE_KEY, JSON.stringify(bag));
    } catch {
      // Storage can be disabled or full; keep the app usable for this session.
    }
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private copySampleBag(): GolfClub[] {
    return SAMPLE_BAG.map((club) => ({ ...club }));
  }
}

function isGolfClub(value: unknown): value is GolfClub {
  if (!value || typeof value !== 'object') return false;
  const club = value as Partial<GolfClub>;
  return typeof club.id === 'string' && club.id.trim().length > 0
    && typeof club.name === 'string' && club.name.trim().length > 0
    && (club.carryDistanceYards === undefined || (typeof club.carryDistanceYards === 'number' && Number.isFinite(club.carryDistanceYards) && club.carryDistanceYards > 0))
    && (club.loftDegrees === undefined || (typeof club.loftDegrees === 'number' && Number.isFinite(club.loftDegrees)))
    && (club.totalDistanceYards === undefined || (typeof club.totalDistanceYards === 'number' && Number.isFinite(club.totalDistanceYards) && club.totalDistanceYards > 0))
    && (club.notes === undefined || typeof club.notes === 'string')
    && (club.typicalMiss === undefined || ['left', 'right', 'short', 'long', 'none'].includes(club.typicalMiss))
    && (club.distanceSource === 'estimated' || club.distanceSource === 'measured')
    && typeof club.active === 'boolean';
}
