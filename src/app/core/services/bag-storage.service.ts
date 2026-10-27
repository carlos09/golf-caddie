import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { GolfClub } from '../models/golf-club.model';

const STORAGE_KEY = 'golf-caddie.club-bag.v2';
const LEGACY_STORAGE_KEY = 'golf-caddie.club-bag.v1';

const PERSONAL_BAG: GolfClub[] = [
  { id: 'personal-driver', name: 'Driver', loftDegrees: 10.5, carryDistanceYards: 200, totalDistanceYards: 220, distanceSource: 'estimated', active: true },
  { id: 'personal-4-hybrid', name: '4 Hybrid', loftDegrees: 21, carryDistanceYards: 190, totalDistanceYards: 200, distanceSource: 'estimated', active: true },
  { id: 'personal-5-iron', name: '5 Iron', loftDegrees: 24, carryDistanceYards: 170, totalDistanceYards: 175, distanceSource: 'estimated', active: true },
  { id: 'personal-6-iron', name: '6 Iron', loftDegrees: 27, carryDistanceYards: 160, totalDistanceYards: 165, distanceSource: 'estimated', active: true },
  { id: 'personal-7-iron', name: '7 Iron', loftDegrees: 30, carryDistanceYards: 150, totalDistanceYards: 155, distanceSource: 'estimated', active: true },
  { id: 'personal-8-iron', name: '8 Iron', loftDegrees: 34, carryDistanceYards: 140, totalDistanceYards: 145, distanceSource: 'estimated', active: true },
  { id: 'personal-9-iron', name: '9 Iron', loftDegrees: 38, carryDistanceYards: 130, totalDistanceYards: 135, distanceSource: 'estimated', active: true },
  { id: 'personal-pw', name: 'PW', loftDegrees: 43, carryDistanceYards: 120, totalDistanceYards: 125, distanceSource: 'estimated', active: true },
  { id: 'personal-aw', name: 'AW', loftDegrees: 47, carryDistanceYards: 110, totalDistanceYards: 115, distanceSource: 'estimated', active: true },
  { id: 'personal-54-wedge', name: '54 Wedge', loftDegrees: 54, carryDistanceYards: 105, totalDistanceYards: 108, distanceSource: 'estimated', active: true },
  { id: 'personal-58-wedge', name: '58 Wedge', loftDegrees: 58, carryDistanceYards: 65, totalDistanceYards: 70, distanceSource: 'estimated', active: true },
  { id: 'personal-60-wedge', name: '60 Wedge', loftDegrees: 60, carryDistanceYards: 75, totalDistanceYards: 78, distanceSource: 'estimated', active: true },
  { id: 'personal-putter', name: 'Putter', distanceSource: 'estimated', active: true },
];

@Injectable({ providedIn: 'root' })
export class BagStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  getBag(): GolfClub[] {
    const storage = this.getStorage();
    if (!storage) return this.copyPersonalBag();

    try {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.every(isGolfClub) ? parsed : this.copyPersonalBag();
      }

      const legacySaved = storage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved === null) return this.copyPersonalBag();

      const legacyParsed: unknown = JSON.parse(legacySaved);
      const legacyBag = Array.isArray(legacyParsed) && legacyParsed.every(isGolfClub) ? legacyParsed : [];
      const migrated = mergePersonalBag(legacyBag);
      storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return this.copyPersonalBag();
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

  private copyPersonalBag(): GolfClub[] {
    return PERSONAL_BAG.map((club) => ({ ...club }));
  }
}

function mergePersonalBag(savedBag: GolfClub[]): GolfClub[] {
  const savedByName = new Map(savedBag.map((club) => [normalizeClubName(club.name), club]));
  const includedIds = new Set<string>();

  const personalClubs = PERSONAL_BAG.map((personalClub) => {
    const savedClub = savedByName.get(normalizeClubName(personalClub.name));
    if (!savedClub) return { ...personalClub };

    includedIds.add(savedClub.id);
    // Replace the original placeholder clubs, but keep any club details the golfer customized.
    if (savedClub.id.startsWith('sample-')) return { ...personalClub };
    return { ...personalClub, ...savedClub, name: personalClub.name };
  });

  const customClubs = savedBag.filter((club) => !includedIds.has(club.id) && !club.id.startsWith('sample-'));
  return [...personalClubs, ...customClubs];
}

function normalizeClubName(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'pitchingwedge') return 'pw';
  if (normalized === 'approachwedge') return 'aw';
  return normalized;
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
