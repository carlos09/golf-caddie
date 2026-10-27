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
  readonly activeClubCount = computed(() => this.bag().filter((club) => club.active && club.carryDistanceYards !== undefined).length);

  readonly shotForm = this.formBuilder.nonNullable.group({
    distanceToPinYards: [150, [Validators.required, Validators.min(1), Validators.max(600)]],
    lieType: ['fairway' as ShotInput['lieType']],
    ballPosition: ['level' as ShotInput['ballPosition']],
    slope: ['level' as ShotInput['slope']],
    bunkerInFront: [false],
    waterInFront: [false],
    hazardCarryYards: ['', [Validators.pattern(/^$|^\d+(\.\d+)?$/), Validators.min(1), Validators.max(600)]],
    treeObstruction: [false],
    treeShotPath: ['uncertain' as ShotInput['treeShotPath']],
    wind: ['calm' as ShotInput['wind']],
  });

  splitSwingCues(warning: string): string[] {
    return warning
      .replace(/^Swing:\s*/, '')
      .split(';')
      .map((cue) => cue.trim().replace(/[.!?]+$/, ''))
      .filter(Boolean)
      .map((cue) => cue.charAt(0).toUpperCase() + cue.slice(1));
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
