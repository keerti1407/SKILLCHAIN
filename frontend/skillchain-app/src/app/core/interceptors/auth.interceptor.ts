import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../services/auth.service';

function isPublicSkillChainRequest(url: string): boolean {
  const base = environment.apiBaseUrl;
  return (
    url.startsWith(`${base}/auth/login`) ||
    url.includes(`${base}/certificate/public/verify/`)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  let outgoing = req;
  const token = auth.getToken();
  if (token && req.url.startsWith(environment.apiBaseUrl) && !isPublicSkillChainRequest(req.url)) {
    outgoing = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        toast.error('Session expired. Please sign in again.');
        auth.logout();
      }
      if (err.status === 0) {
        console.error('[SkillChain] Network error — API may be offline:', req.url);
      }
      return throwError(() => err);
    })
  );
};
