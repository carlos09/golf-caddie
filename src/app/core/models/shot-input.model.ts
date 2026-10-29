export type LieType = 'fairway' | 'rough' | 'bunker' | 'tee' | 'other';
export type FootPosition = 'level' | 'above' | 'below';
export type SlopeDirection = 'level' | 'uphill' | 'downhill';
export type TreeShotPath = 'clear' | 'blocked' | 'uncertain';

export interface ShotInput {
  distanceToPinYards: number;
  lieType: LieType;
  ballPosition: FootPosition;
  slope: SlopeDirection;
  bunkerInFront: boolean;
  waterInFront: boolean;
  /** Estimated carry from the ball to the far edge of the front hazard. */
  hazardCarryYards?: number;
  treeObstruction: boolean;
  treeShotPath: TreeShotPath;
}
