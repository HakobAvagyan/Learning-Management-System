import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { instructorGuard, adminGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses/create',
    loadComponent: () =>
      import('./features/courses/create-course.component').then(m => m.CreateCourseComponent),
    canActivate: [authGuard, instructorGuard],
  },
  {
    path: 'courses/:courseId/view',
    loadComponent: () =>
      import('./features/courses/course-view.component').then(m => m.CourseViewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'progress/course/:courseId',
    loadComponent: () =>
      import('./features/progress/course-progress.component').then(m => m.CourseProgressComponent),
    canActivate: [authGuard],
  },
  {
    path: 'quiz/:quizId',
    loadComponent: () =>
      import('./features/quiz/quiz-take.component').then(m => m.QuizTakeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses/:courseId/quizzes',
    loadComponent: () =>
      import('./features/quiz/quiz-manage.component').then(m => m.QuizManageComponent),
    canActivate: [authGuard, instructorGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];