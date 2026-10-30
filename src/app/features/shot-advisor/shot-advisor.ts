import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BagStorageService } from '../../core/services/bag-storage.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { Recommendation } from '../../core/models/recommendation.model';
import { ShotInput } from '../../core/models/shot-input.model';

@Component({
  selector: 'app-shot-advisor',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './shot-advisor.html',
  styleUrl: './shot-advisor.scss',
})
export class ShotAdvisorComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly bagStorage = inject(BagStorageService);
  private readonly recommendationService = inject(RecommendationService);
  private readonly bag = signal(this.bagStorage.getBag());

  readonly recommendation = signal<Recommendation | null>(null);
  readonly activeClubCount = computed(
    () => this.bag().filter((club) => club.active && club.carryDistanceYards !== undefined).length,
  );

  readonly lieOptions: { value: ShotInput['lieType']; label: string; image: string }[] = [
    { value: 'fairway', label: 'Fairway', image: 'fairway-icon.svg' },
    { value: 'rough', label: 'Rough', image: 'rough-icon.svg' },
    { value: 'bunker', label: 'Bunker', image: 'bunker-icon.svg' },
    { value: 'tee', label: 'Tee', image: 'tee-icon.svg' },
    { value: 'other', label: 'Other', image: 'level-icon.svg' },
  ];
  readonly ballPositionOptions: {
    value: ShotInput['ballPosition'];
    label: string;
    image: string;
  }[] = [
    { value: 'level', label: 'Level', image: 'level-icon.svg' },
    { value: 'above', label: 'Above feet', image: 'above-feet-icon.svg' },
    { value: 'below', label: 'Below feet', image: 'below-feet-icon.svg' },
  ];
  readonly slopeOptions: { value: ShotInput['slope']; label: string; image: string }[] = [
    { value: 'level', label: 'Level', image: 'level-icon.svg' },
    { value: 'uphill', label: 'Uphill', image: 'uphill-icon.svg' },
    { value: 'downhill', label: 'Downhill', image: 'downhill-icon.svg' },
  ];

  readonly shotForm = this.formBuilder.nonNullable.group({
    distanceToPinYards: [150, [Validators.required, Validators.min(1), Validators.max(600)]],
    lieType: ['fairway' as ShotInput['lieType']],
    ballPosition: ['level' as ShotInput['ballPosition']],
    slope: ['level' as ShotInput['slope']],
    bunkerSand: ['unknown' as ShotInput['bunkerSand']],
    chipShot: [false],
    bunkerInFront: [false],
    waterInFront: [false],
    hazardCarryYards: [
      '',
      [Validators.pattern(/^$|^\d+(\.\d+)?$/), Validators.min(1), Validators.max(600)],
    ],
    treeObstruction: [false],
    treeShotPath: ['uncertain' as ShotInput['treeShotPath']],
  });

  clubIconFor(name: string): string {
    const clubName = name.toLowerCase();
    let icon = 'iron-icon.svg';

    if (clubName.includes('driver')) {
      icon = 'driver-icon.svg';
    } else if (clubName.includes('wedge') || /\b(pw|aw)\b/.test(clubName)) {
      icon = 'wedge-icon-icon.svg';
    } else if (clubName.includes('hybrid') || clubName.includes('wood')) {
      icon = 'hybrid-wood-icon.svg';
    }

    return `images/thumbs/${icon}`;
  }

  getRecommendation(): void {
    if (this.shotForm.invalid) {
      this.shotForm.controls.distanceToPinYards.markAsTouched();
      return;
    }
    const values = this.shotForm.getRawValue();
    const shot: ShotInput = {
      ...values,
      hazardCarryYards: values.hazardCarryYards ? Number(values.hazardCarryYards) : undefined,
    };
    this.recommendation.set(this.recommendationService.recommend(shot, this.bag()));
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches) {
      window.setTimeout(() => {
        const panel = window.document.getElementById('recommendation-panel');
        if (panel) {
          const top = panel.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, top - 16), behavior: 'smooth' });
        }
      }, 0);
    }
  }
}
