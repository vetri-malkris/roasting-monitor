import { Component, inject } from "@angular/core";
import { NgIf } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { SessionService } from "./core/session.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NgIf],
  template: `
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark">☕</span>

        <div class="brand-text">
          <span class="brand-name">Roasting Monitor</span>
          <span class="brand-sub">Performance Visibility</span>
        </div>
      </div>

      <div class="topbar-actions" *ngIf="session.user() as u">
        <span class="user-badge">
          👤 {{ u.label }}
        </span>

        <button
          type="button"
          class="btn btn-ghost"
          (click)="logout()"
        >
          Log Out
        </button>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
})
export class AppComponent {
  session = inject(SessionService);
  router = inject(Router);

  logout(): void {
    this.session.logout();
    this.router.navigateByUrl("/login");
  }
}