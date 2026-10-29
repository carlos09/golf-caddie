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

    const hazardTips: string[] = [];
    if (shot.bunkerInFront || shot.waterInFront) {
      if (shot.hazardCarryYards === undefined) {
        hazardTips.push(
          shot.waterInFront
            ? 'Water: Carry beyond the far edge. Favor a safe landing.'
            : 'Bunker ahead: carry beyond the far edge, not just to the pin.',
        );
      } else {
        const carryNeededWithMargin = shot.hazardCarryYards + 5;
        if (primaryClub.carryDistanceYards < carryNeededWithMargin) {
          const clearingAlternative = clubs.find((club) => club.carryDistanceYards >= carryNeededWithMargin);
          hazardTips.push(
            clearingAlternative
              ? `Need ~${carryNeededWithMargin} yd to clear. ${clearingAlternative.name} carries ${clearingAlternative.carryDistanceYards} yd.`
              : `Need ~${carryNeededWithMargin} yd to clear. Lay up.`,
          );
        } else {
          hazardTips.push(
            shot.waterInFront
              ? `Carry ~${primaryClub.carryDistanceYards} yd. Clear ~${carryNeededWithMargin} yd and favor a safe landing.`
              : `Carry ~${primaryClub.carryDistanceYards} yd clears the ~${carryNeededWithMargin} yd hazard.`,
          );
        }
      }
    }

    const treeTips: string[] = [];
    if (shot.treeObstruction) {
      treeTips.push(
        shot.treeShotPath === 'clear'
          ? 'Trees: use a full shot only with a clear swing and flight path.'
          : 'Trees: if the path is blocked or uncertain, punch out.',
      );
    }

    const lieTips: string[] = [];
    if (shot.lieType === 'bunker') {
      if (shot.bunkerSand === 'firm') {
        lieTips.push('Firm sand: Square the face slightly. Use a controlled, steeper strike.');
      } else if (shot.bunkerSand === 'soft') {
        lieTips.push('Soft sand: Open the face. Let the bounce glide through.');
      } else {
        lieTips.push('Bunker: Splash sand just behind the ball. Follow through.');
      }
    } else if (shot.lieType === 'rough') {
      lieTips.push('Rough: Contact varies. Club up if the ball sits down.');
    }

    const positionTips: string[] = [];
    if (shot.ballPosition === 'below') {
      positionTips.push('Below feet (RH): Tends right. Aim left. Widen stance and club up.');
    } else if (shot.ballPosition === 'above') {
      positionTips.push('Above feet (RH): Tends left. Aim right. Grip down and club up.');
    }

    const slopeTips: string[] = [];
    if (shot.slope === 'uphill') {
      slopeTips.push('Uphill: Higher, shorter flight. Club up and match shoulders to slope.');
    } else if (shot.slope === 'downhill') {
      slopeTips.push('Downhill: Lower, longer flight. Consider less club and swing with slope.');
    }

    const shotTypeTips: string[] = [];
    if (shot.chipShot) {
      shotTypeTips.push('Chip: Stand tall with weight forward. Ball back, slight shaft lean. Brush after ball.');
      shotTypeTips.push('If clear, use less loft and land it early to roll.');
    } else if (/\bdriver\b/i.test(primaryClub.name)) {
      shotTypeTips.push('Driver: Ball by lead heel. Tee for center contact and turn through.');
    } else if (/\b(wedge|PW|AW)\b/i.test(primaryClub.name)) {
      shotTypeTips.push('Wedge: Hands slightly ahead. Strike ball before turf and control carry.');
    }

    // Keep safety first, but reserve a slot for the directional advice the user selected.
    const warnings = [
      ...hazardTips,
      ...positionTips,
      ...treeTips,
      ...lieTips,
      ...slopeTips,
      ...shotTypeTips,
    ].slice(0, 3);

    return {
      primaryClub,
      alternativeClub: clubs[1],
      estimatedCarryDistanceYards: primaryClub.carryDistanceYards,
      explanation: `${primaryClub.name} is the closest carry match in your active bag to ${shot.distanceToPinYards} yards. The club choice is a starting point. Use the notes below to judge the shot in front of you.`,
      warnings,
    };
  }
}
