import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const instructorGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const roles  = auth.currentUser()?.roles ?? [];
  if (roles.includes('ROLE_INSTRUCTOR') || roles.includes('ROLE_ADMIN')) return true;
  router.navigate(['/home']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.roles?.includes('ROLE_ADMIN')) return true;
  router.navigate(['/home']);
  return false;
};