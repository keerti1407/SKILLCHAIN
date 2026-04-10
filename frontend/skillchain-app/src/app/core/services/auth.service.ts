import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/certificate.model';

const STORAGE_TOKEN = 'skillchain_token';
const STORAGE_ROLE = 'skillchain_role';
const STORAGE_WALLET = 'skillchain_wallet';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public http = inject(HttpClient);
  public router = inject(Router);

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(STORAGE_TOKEN, res.access_token);
          localStorage.setItem(STORAGE_ROLE, res.role);
          localStorage.setItem(STORAGE_WALLET, res.wallet);
          this.redirectByRole(res.role);
        })
      );
  }

  redirectByRole(role: string): void {
    switch (role) {
      case 'institution':
        this.router.navigate(['/institution']);
        break;
      case 'student':
        this.router.navigate(['/student']);
        break;
      case 'employer':
        this.router.navigate(['/employer']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN);
  }

  getRole(): string | null {
    return localStorage.getItem(STORAGE_ROLE);
  }

  getWallet(): string | null {
    return localStorage.getItem(STORAGE_WALLET);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_ROLE);
    localStorage.removeItem(STORAGE_WALLET);
    this.router.navigate(['/login']);
  }
}
