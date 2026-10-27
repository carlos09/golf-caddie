import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GolfClub } from '../../core/models/golf-club.model';
import { BagStorageService } from '../../core/services/bag-storage.service';

@Component({
  selector: 'app-my-bag',
  imports: [ReactiveFormsModule],
  templateUrl: './my-bag.html',
  styleUrl: './my-bag.scss',
})
export class MyBagComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storage = inject(BagStorageService);
  readonly clubs = signal(this.storage.getBag());

  readonly clubForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    loftDegrees: ['', [Validators.pattern(/^$|^\d+(\.\d+)?$/), Validators.min(0), Validators.max(80)]],
    carryDistanceYards: ['', [Validators.pattern(/^$|^\d+(\.\d+)?$/), Validators.min(1), Validators.max(400)]],
    totalDistanceYards: ['', [Validators.pattern(/^$|^\d+(\.\d+)?$/), Validators.min(1), Validators.max(450)]],
  });

  addClub(): void {
    if (this.clubForm.invalid) return;
    const value = this.clubForm.getRawValue();
    if (!value.name.trim()) return;
    const carryDistanceYards = value.carryDistanceYards ? Number(value.carryDistanceYards) : undefined;
    const totalDistanceYards = value.totalDistanceYards ? Number(value.totalDistanceYards) : undefined;
    const newClub: GolfClub = {
      id: `club-${Date.now()}`,
      name: value.name.trim(),
      loftDegrees: value.loftDegrees ? Number(value.loftDegrees) : undefined,
      carryDistanceYards,
      totalDistanceYards,
      distanceSource: 'estimated',
      active: true,
    };
    const updated = [...this.clubs(), newClub];
    this.clubs.set(updated);
    this.storage.saveBag(updated);
    this.clubForm.reset({ name: '', loftDegrees: '', carryDistanceYards: '', totalDistanceYards: '' });
  }

  toggleClub(club: GolfClub): void {
    const updated = this.clubs().map((item) => item.id === club.id ? { ...item, active: !item.active } : item);
    this.clubs.set(updated);
    this.storage.saveBag(updated);
  }

  removeClub(club: GolfClub): void {
    const updated = this.clubs().filter((item) => item.id !== club.id);
    this.clubs.set(updated);
    this.storage.saveBag(updated);
  }
}
