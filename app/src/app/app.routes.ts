import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'issues/:year/:week',
    loadComponent: () => import('./features/issue/issue').then((m) => m.IssuePage),
  },
  {
    path: 'community',
    loadComponent: () => import('./features/community/community').then((m) => m.CommunityPage),
  },
  {
    path: 'submit',
    loadComponent: () => import('./features/submit/submit').then((m) => m.SubmitPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.AdminPage),
  },
  { path: '**', redirectTo: '' },
];
