import { GolfClub } from './golf-club.model';

export interface Recommendation {
  primaryClub: GolfClub;
  alternativeClub?: GolfClub;
  estimatedCarryDistanceYards: number;
  explanation: string;
  warnings: string[];
}
