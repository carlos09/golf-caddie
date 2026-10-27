export type DistanceSource = 'estimated' | 'measured';
export type TypicalMiss = 'left' | 'right' | 'short' | 'long' | 'none';

export interface GolfClub {
  id: string;
  name: string;
  loftDegrees?: number;
  carryDistanceYards?: number;
  totalDistanceYards?: number;
  distanceSource: DistanceSource;
  active: boolean;
  notes?: string;
  typicalMiss?: TypicalMiss;
}
