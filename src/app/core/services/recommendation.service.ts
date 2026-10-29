import { Injectable } from '@angular/core';
import { GolfClub } from '../models/golf-club.model';
import { Recommendation } from '../models/recommendation.model';
import { ShotInput } from '../models/shot-input.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  recommend(shot: ShotInput, bag: GolfClub[]): Recommendation | null {
    const clubs = bag
      .filter((club): club is GolfClub & { carryDistanceYards: number } => club.active && club.carryDistanceYards !== undefined)
      .sort((a, b) => Math.abs(a.carryDistanceYards - shot.distanceToPinYards) - Math.abs(b.carryDistanceYards - shot.distanceToPinYards));
    const primaryClub = clubs[0];
    if (!primaryClub) return null;

    const warnings: string[] = [];

    if (shot.bunkerInFront || shot.waterInFront) {
      const waterAdvice = shot.waterInFront ? ' Favor a safe landing over the pin.' : '';
      if (shot.hazardCarryYards === undefined) {
        const clearanceAdvice = shot.bunkerInFront && !shot.waterInFront ? ' Leave room to clear it.' : '';
        warnings.push(`Front hazard: judge carry to the far edge, not just the pin.${clearanceAdvice}${waterAdvice}`);
      } else {
        const carryNeededWithMargin = shot.hazardCarryYards + 5;
        if (primaryClub.carryDistanceYards < carryNeededWithMargin) {
          const shortBy = carryNeededWithMargin - primaryClub.carryDistanceYards;
          const clearingAlternative = clubs.find((club) => club.carryDistanceYards >= carryNeededWithMargin);
          const nextStep = clearingAlternative
            ? `Longer option: ${clearingAlternative.carryDistanceYards} yd est.`
            : 'No club estimate reaches it; lay up.';
          warnings.push(`Clear ~${carryNeededWithMargin} yd (far edge + 5). Current pick is ~${shortBy} yd short. ${nextStep}${waterAdvice}`);
        } else {
          warnings.push(`Clear ~${carryNeededWithMargin} yd (far edge + 5); current pick is ${primaryClub.carryDistanceYards} yd est.${waterAdvice}`);
        }
      }
    }

    if (shot.treeObstruction) {
      if (shot.treeShotPath === 'clear') {
        warnings.push('Trees: take the normal shot only if the full swing and flight window are clear; otherwise punch out to a safe spot.');
      } else {
        warnings.push('Trees block or cloud the window: punch out to a safe spot instead of forcing it through.');
      }
    }

    const stanceCues: string[] = [];
    if (shot.ballPosition === 'below') stanceCues.push('below feet may leak right for right-handed players');
    if (shot.ballPosition === 'above') stanceCues.push('above feet may move left for right-handed players');
    if (shot.slope === 'downhill') stanceCues.push('downhill changes flight');
    if (shot.slope === 'uphill') stanceCues.push('uphill raises launch');

    const distanceCues: string[] = [];
    if (shot.lieType === 'rough') distanceCues.push('rough can reduce carry');
    if (shot.lieType === 'bunker') distanceCues.push('from sand, clear the lip');

    if (stanceCues.length || distanceCues.length) {
      const cues = [...stanceCues, ...distanceCues].join('; ');
      warnings.push(`Swing: Stay balanced; ${cues}.`);
    }

    return {
      primaryClub,
      alternativeClub: clubs[1],
      estimatedCarryDistanceYards: primaryClub.carryDistanceYards,
      explanation: `${primaryClub.name} is the closest carry match in your active bag to ${shot.distanceToPinYards} yards. The club choice is a starting point; use the notes below to judge the shot in front of you.`,
      warnings,
    };
  }
}
