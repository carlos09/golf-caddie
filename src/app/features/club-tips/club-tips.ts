import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GolfClub } from '../../core/models/golf-club.model';
import { BagStorageService } from '../../core/services/bag-storage.service';

type ClubGroup = 'driver' | 'iron' | 'wedge' | 'hybridWood';

@Component({
  selector: 'app-club-tips',
  imports: [RouterLink],
  templateUrl: './club-tips.html',
  styleUrl: './club-tips.scss',
})
export class ClubTipsComponent {
  private readonly bagStorage = inject(BagStorageService);
  private readonly clubs = signal(this.bagStorage.getBag());

  readonly selectedGroup = signal<ClubGroup>('driver');
  readonly selectedClubId = signal('');
  readonly groupOptions: { value: ClubGroup; label: string; icon: string }[] = [
    { value: 'driver', label: 'Driver', icon: 'driver-icon.svg' },
    { value: 'iron', label: 'Irons', icon: 'iron-icon.svg' },
    { value: 'wedge', label: 'Wedge', icon: 'wedge-icon.svg' },
    { value: 'hybridWood', label: 'Hybrid / Wood', icon: 'hybrid-wood-icon.svg' },
  ];

  readonly matchingClubs = computed(() =>
    this.clubs().filter((club) => this.matchesGroup(club, this.selectedGroup())),
  );
  readonly selectedClub = computed(
    () =>
      this.matchingClubs().find((club) => club.id === this.selectedClubId()) ??
      this.matchingClubs()[0],
  );

  readonly setupTips = computed(() => {
    const club = this.selectedClub();
    switch (this.selectedGroup()) {
      case 'driver':
        return [
          'Ball just inside your lead heel; keep your shoulders square to the target.',
          'Tee with about half the ball above the crown.',
        ];
      case 'iron':
        return [
          this.ironBallPosition(club?.name ?? ''),
          'Keep posture balanced with pressure near the middle of your feet.',
        ];
      case 'wedge':
        return ['For a stock wedge, play it near center.', 'Use a narrow stance; favor your lead side slightly.'];
      case 'hybridWood':
        return this.isFairwayWood(club?.name ?? '')
          ? ['Ball forward, but not as far up as driver.', 'From a tee, keep the ball sitting low.']
          : ['Ball just forward of center, like a long iron.', 'Keep your chest over the ball; hands slightly ahead.'];
    }
  });

  readonly swingTips = computed(() => {
    switch (this.selectedGroup()) {
      case 'driver':
        return [
          'Tilt your upper body slightly away from the target.',
          'Catch the ball on a slight upswing; finish in balance.',
        ];
      case 'iron':
        return [
          'Shift pressure toward your lead foot; keep your chest over the ball.',
          'Strike ball first, then turf. Divot starts beyond the ball.',
        ];
      case 'wedge':
        return [
          'For a stock full wedge, brush turf after the ball; keep moving through.',
          'Control carry with a shorter swing, not a harder hit.',
        ];
      case 'hybridWood':
        return this.isFairwayWood(this.selectedClub()?.name ?? '')
          ? ['From turf, strike ball then brush the ground; don’t try to lift it.', 'Keep turning through a shallow, balanced swing.']
          : ['Make a slightly descending strike, like an iron.', 'Let a small divot start beyond the ball; don’t scoop.'];
    }
  });

  selectGroup(group: ClubGroup): void {
    this.selectedGroup.set(group);
    this.selectedClubId.set('');
  }

  selectClub(id: string): void {
    this.selectedClubId.set(id);
  }

  private matchesGroup(club: GolfClub, group: ClubGroup): boolean {
    const name = club.name.toLowerCase();
    switch (group) {
      case 'driver':
        return name.includes('driver');
      case 'iron':
        return /\biron\b|\b[3-9]\s*i\b/.test(name);
      case 'wedge':
        return name.includes('wedge') || /\b(pw|aw)\b/.test(name);
      case 'hybridWood':
        return name.includes('hybrid') || name.includes('wood') || /\b[3-9]\s*w\b/.test(name);
    }
  }

  private ironBallPosition(name: string): string {
    const clubNumber = name.match(/\b([3-9])\s*(?:iron|i)\b/i)?.[1];
    if (!clubNumber) return 'Ball near center; move it slightly forward for longer irons.';
    const number = Number(clubNumber);
    if (number <= 5) return 'Long iron: ball slightly forward of center.';
    if (number >= 8) return 'Short iron: ball at center or just back.';
    return 'Mid iron: ball near center.';
  }

  private isFairwayWood(name: string): boolean {
    const normalized = name.toLowerCase();
    return normalized.includes('wood') || /\b[3-9]\s*w\b/.test(normalized);
  }
}
