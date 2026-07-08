import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface AuthResponse {
  id: number;
  token: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/auth';

  readonly currentUser = signal<AuthResponse | null>(this.loadFromStorage());

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => this.saveSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('lms_token');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem('lms_token', response.token);
    localStorage.setItem('lms_user', JSON.stringify(response));
    this.currentUser.set(response);
  }

  private loadFromStorage(): AuthResponse | null {
    const raw = localStorage.getItem('lms_user');
    return raw ? JSON.parse(raw) : null;
  }
}