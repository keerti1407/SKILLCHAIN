import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const roles = route.data['roles'] as string[] | undefined;
  if (roles?.length) {
    const role = auth.getRole();
    if (!role || !roles.includes(role)) {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
