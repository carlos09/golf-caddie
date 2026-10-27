import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/shot-advisor/shot-advisor').then((m) => m.ShotAdvisorComponent), title: 'Shot Advisor · Golf Caddie' },
  { path: 'my-bag', loadComponent: () => import('./features/my-bag/my-bag').then((m) => m.MyBagComponent), title: 'My Bag · Golf Caddie' },
  { path: 'settings', loadComponent: () => import('./features/settings/settings').then((m) => m.SettingsComponent), title: 'Settings · Golf Caddie' },
  { path: '**', redirectTo: '' },
];
