import { Component, inject, signal } from '@angular/core';
import { GolfClub } from '../../core/models/golf-club.model';
import { BagStorageService } from '../../core/services/bag-storage.service';

interface ShotTip {
  title: string;
  image: string;
  tag: string;
  goal: string;
  when: string;
  setup: string[];
  swing: string[];
  commonMistake: string;
  practice: string;
  fallbackClub: string;
  clubMatches: (club: GolfClub) => boolean;
}

@Component({
  selector: 'app-shot-tips',
  templateUrl: './shot-tips.html',
  styleUrl: './shot-tips.scss',
})
export class ShotTipsComponent {
  private readonly bagStorage = inject(BagStorageService);
  private readonly clubs = signal(this.bagStorage.getBag());

  readonly shots: ShotTip[] = [
    {
      title: 'Flop Shot',
      image: 'flop.svg',
      tag: 'HIGH TRAJECTORY · SOFT LANDING',
      goal: 'Fly high and stop with little rollout.',
      when: 'Carry a bunker or obstacle when you have a good lie and room to land near the pin.',
      setup: ['Open the face before gripping; stance slightly open.', 'Play the ball forward; favor your lead foot slightly.'],
      swing: ['Make a smooth, relatively long swing and keep turning through.', 'Let the clubhead pass and slide under the ball; maintain speed.'],
      commonMistake: 'Slowing down or trying to scoop the ball with your hands.',
      practice: 'With a 60° wedge, practice smooth swings over a small target.',
      fallbackClub: '60° wedge.',
      clubMatches: (club) => club.loftDegrees === 60,
    },
    {
      title: 'Chip Shot',
      image: 'chip.svg',
      tag: 'LOW TRAJECTORY · MORE ROLL',
      goal: 'Land the ball on the green early and let it roll.',
      when: 'You are close to the green with plenty of green between you and the pin.',
      setup: ['Feet close together; play the ball back.', 'Favor your lead foot; hands slightly ahead.'],
      swing: ['Use a short, putting-like motion with quiet wrists.', 'Rock your shoulders and brush through the ball smoothly.'],
      commonMistake: 'Scooping the ball or adding too much wrist action.',
      practice: 'Hit 10 balls to one landing spot, then compare how far each club rolls.',
      fallbackClub: 'PW, AW, or 9-iron; choose by desired rollout.',
      clubMatches: (club) => /\b(pw|aw|9\s*iron|9i)\b/i.test(club.name) || [43, 47].includes(club.loftDegrees ?? 0),
    },
    {
      title: 'Pitch Shot',
      image: 'pitch.svg',
      tag: 'MEDIUM TRAJECTORY · SOME ROLL',
      goal: 'Carry farther than a chip with less rollout than a full shot.',
      when: 'A partial shot is needed; roughly 20–60 yards, depending on your skill and club.',
      setup: ['Use a hip-width, slightly open stance; ball near center.', 'Favor your lead foot slightly; keep hands neutral or just ahead.'],
      swing: ['Make a controlled partial swing and turn your chest through.', 'Use a longer backswing for more distance; keep arms and body moving together.'],
      commonMistake: 'Hitting harder with the arms instead of making a longer swing.',
      practice: 'With a 54° wedge, compare half, three-quarter, and full swing carries.',
      fallbackClub: '54°, 58°, or 60° wedge.',
      clubMatches: (club) => [54, 58, 60].includes(club.loftDegrees ?? 0),
    },
    {
      title: 'Greenside Bunker Shot',
      image: 'greenside-bunker.svg',
      tag: 'SAND SPLASH · HIGH TRAJECTORY',
      goal: 'Use the sand to lift the ball onto the green.',
      when: 'The ball is in a greenside bunker with sand beneath and around it.',
      setup: ['Open the face before gripping; set a wide, open stance.', 'Dig your feet in slightly and favor your lead foot.'],
      swing: ['Enter the sand about 1–2 inches behind the ball.', 'Make a committed swing; let the club slide through the sand and finish toward target.'],
      commonMistake: 'Trying to pick the ball cleanly or slowing down in the sand.',
      practice: 'Draw a line in the sand and practice entering just beyond it.',
      fallbackClub: '58° or 60° wedge, depending on lie and carry.',
      clubMatches: (club) => [58, 60].includes(club.loftDegrees ?? 0),
    },
    {
      title: 'Punch / Recovery Shot',
      image: 'punch-recovery.svg',
      tag: 'LOW TRAJECTORY · CONTROLLED DISTANCE',
      goal: 'Keep the ball low and get safely back into play.',
      when: 'Trees, branches, or wind make a normal high shot risky.',
      setup: ['Aim at a safe opening; play the ball back of center.', 'Narrow your stance and favor your lead foot.'],
      swing: ['Choose enough loft to clear the obstacle.', 'Use a short backswing and waist-high finish; keep the strike controlled.'],
      commonMistake: 'Using too much speed or loft and reaching the obstacle again.',
      practice: 'Practice under a low target and focus on a safe landing area.',
      fallbackClub: '7–9 iron; select by the clearance and distance needed.',
      clubMatches: (club) => /\b[7-9]\s*iron\b/i.test(club.name),
    },
    {
      title: 'Draw Shot',
      image: 'draw.svg',
      tag: 'CONTROLLED CURVE · RIGHT TO LEFT',
      goal: 'Start right of target and curve back left (right-handed golfer).',
      when: 'Shape around an obstacle or add a little rollout.',
      setup: ['Align body slightly right of target; use normal ball position.', 'Aim the clubface closer to target than your body line.'],
      swing: ['Make a normal, balanced swing along your body line.', 'Let the path work slightly in-to-out; don’t force your hands to roll.'],
      commonMistake: 'Over-rotating the hands and turning a draw into a hook.',
      practice: 'Start with a 9-iron and practice a small curve that starts right and returns.',
      fallbackClub: '9-iron to practice; use a driver, hybrid, or iron you control.',
      clubMatches: () => false,
    },
    {
      title: 'Fade Shot',
      image: 'fade.svg',
      tag: 'CONTROLLED CURVE · LEFT TO RIGHT',
      goal: 'Start left of target and curve back right (right-handed golfer).',
      when: 'Shape around an obstacle, guide a tee shot, or avoid trouble left.',
      setup: ['Align body slightly left of target; use normal ball position.', 'Aim the clubface closer to target than your body line.'],
      swing: ['Make a smooth, balanced swing along your body line.', 'Let the path work slightly out-to-in; avoid cutting hard across it.'],
      commonMistake: 'An aggressive cut that creates a large slice.',
      practice: 'Start with a 9-iron and practice a small, controlled left-to-right curve.',
      fallbackClub: '9-iron to practice; use a driver, hybrid, or iron you control.',
      clubMatches: () => false,
    },
  ];

  clubsFor(shot: ShotTip): string[] {
    const matches = this.clubs().filter(shot.clubMatches).map((club) => club.name);
    return matches.length ? matches : [shot.fallbackClub];
  }
}
