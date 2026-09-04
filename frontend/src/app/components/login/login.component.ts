import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { Router } from "@angular/router";

import { ApiService } from "../../services/api.service";
import { SessionService } from "../../core/session.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <section class="content">
      <div class="card login-card">

        <div class="card-title">
          Sign In
        </div>

        <div class="card-subtitle">
          Use your application account to continue.
        </div>

        <div class="field">
          <label>Username</label>

          <input
            type="text"
            [(ngModel)]="username"
            placeholder="operator or admin"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label>Password</label>

          <input
            type="password"
            [(ngModel)]="password"
            (keydown.enter)="login()"
            placeholder="Password"
            autocomplete="current-password"
          />
        </div>

        <div
          class="error-text"
          *ngIf="error"
        >
          {{ error }}
        </div>

        <button
          type="button"
          class="btn"
          (click)="login()"
        >
          Sign In
        </button>

        <p class="demo">
          Demo: operator / operator123 · admin / admin123
        </p>

      </div>
    </section>
  `,
})
export class LoginComponent {
  api = inject(ApiService);
  session = inject(SessionService);
  router = inject(Router);

  username = "";
  password = "";
  error = "";

  login(): void {
    this.error = "";

    if (!this.username.trim()) {
      this.error = "Enter username.";
      return;
    }

    if (!this.password) {
      this.error = "Enter password.";
      return;
    }

    this.api.login(
      this.username.trim(),
      this.password
    ).subscribe({
      next: (u) => {
        this.session.login(u);

        if (u.role === "admin") {
          this.router.navigateByUrl("/admin");
        } else {
          this.router.navigateByUrl("/operator");
        }
      },
      error: (e) => {
        this.error =
          e.error?.message ||
          "Incorrect username or password.";
      },
    });
  }
}