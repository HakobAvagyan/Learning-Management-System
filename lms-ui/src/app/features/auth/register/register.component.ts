import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  template: `
    <div class="page-container">
      <mat-card class="auth-card" style="max-width: 480px;">
        <mat-card-header>
          <mat-icon mat-card-avatar color="primary">person_add</mat-icon>
          <mat-card-title>Регистрация</mat-card-title>
          <mat-card-subtitle>Создайте аккаунт для доступа к курсам</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">

            <mat-stepper orientation="vertical" #stepper>

              <!-- Шаг 1: Личные данные -->
              <mat-step label="Личные данные" [stepControl]="personalGroup">
                <div formGroupName="personal" style="display:flex; flex-direction:column; gap:4px; padding-top:12px;">
                  <mat-form-field appearance="outline">
                    <mat-label>Имя</mat-label>
                    <input matInput formControlName="firstName" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Фамилия</mat-label>
                    <input matInput formControlName="lastName" />
                  </mat-form-field>
                  <div>
                    <button mat-button matStepperNext type="button">Далее</button>
                  </div>
                </div>
              </mat-step>

              <!-- Шаг 2: Учётные данные -->
              <mat-step label="Учётные данные" [stepControl]="accountGroup">
                <div formGroupName="account" style="display:flex; flex-direction:column; gap:4px; padding-top:12px;">
                  <mat-form-field appearance="outline">
                    <mat-label>Имя пользователя</mat-label>
                    <mat-icon matPrefix>person</mat-icon>
                    <input matInput formControlName="username" />
                    @if (accountGroup.get('username')?.hasError('required') && accountGroup.get('username')?.touched) {
                      <mat-error>Обязательное поле</mat-error>
                    }
                    @if (accountGroup.get('username')?.hasError('minlength')) {
                      <mat-error>Минимум 3 символа</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <mat-icon matPrefix>email</mat-icon>
                    <input matInput formControlName="email" type="email" />
                    @if (accountGroup.get('email')?.hasError('email') && accountGroup.get('email')?.touched) {
                      <mat-error>Некорректный email</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Пароль</mat-label>
                    <mat-icon matPrefix>key</mat-icon>
                    <input
                      matInput
                      formControlName="password"
                      [type]="hidePassword() ? 'password' : 'text'"
                    />
                    <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                      <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (accountGroup.get('password')?.hasError('minlength')) {
                      <mat-error>Минимум 8 символов</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Подтвердите пароль</mat-label>
                    <mat-icon matPrefix>key</mat-icon>
                    <input
                      matInput
                      formControlName="confirmPassword"
                      [type]="hidePassword() ? 'password' : 'text'"
                    />
                    @if (accountGroup.get('confirmPassword')?.hasError('passwordMismatch')) {
                      <mat-error>Пароли не совпадают</mat-error>
                    }
                  </mat-form-field>

                  <div style="display:flex; gap:8px;">
                    <button mat-button matStepperPrevious type="button">Назад</button>
                    <button mat-button matStepperNext type="button">Далее</button>
                  </div>
                </div>
              </mat-step>

              <!-- Шаг 3: Подтверждение -->
              <mat-step label="Готово">
                <div style="padding-top:12px;">
                  @if (errorMessage()) {
                    <p class="error-message" style="margin-bottom:12px;">{{ errorMessage() }}</p>
                  }
                  <div style="display:flex; gap:8px;">
                    <button mat-button matStepperPrevious type="button">Назад</button>
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="form.invalid || loading()"
                    >
                      @if (loading()) {
                        <mat-spinner diameter="20" style="display:inline-block; margin-right:8px;" />
                      }
                      Зарегистрироваться
                    </button>
                  </div>
                </div>
              </mat-step>

            </mat-stepper>
          </form>
        </mat-card-content>

        <mat-card-footer style="padding:16px; text-align:center;">
          <button mat-button routerLink="/login">Уже есть аккаунт? Войти</button>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly personalGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
  });

  readonly accountGroup = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  readonly form = this.fb.group({
    personal: this.personalGroup,
    account: this.accountGroup,
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { personal, account } = this.form.getRawValue();

    this.authService.register({
      username: account.username ?? '',
      email: account.email ?? '',
      password: account.password ?? '',
      firstName: personal.firstName ?? '',
      lastName: personal.lastName ?? '',
    }).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.errorMessage.set(
          err.status === 409 ? 'Пользователь с таким именем или email уже существует.'
            : 'Ошибка сервера. Попробуйте позже.'
        );
        this.loading.set(false);
      },
    });
  }
}