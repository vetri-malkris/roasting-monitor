import { Component } from "@angular/core";
import { NgIf } from "@angular/common";

import { DashboardComponent } from "./dashboard/dashboard.component";
import { HistoryComponent } from "./history/history.component";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [
    NgIf,
    DashboardComponent,
    HistoryComponent
  ],
  template: `
    <div class="admin-layout">

      <nav class="admin-sidebar">

        <button
          type="button"
          [class.active]="tab === 'dashboard'"
          (click)="tab = 'dashboard'"
        >
          Dashboard
        </button>

        <button
          type="button"
          [class.active]="tab === 'history'"
          (click)="tab = 'history'"
        >
          Roasting History
        </button>

      </nav>

      <div class="admin-main">

        <app-dashboard
          *ngIf="tab === 'dashboard'"
        ></app-dashboard>

        <app-history
          *ngIf="tab === 'history'"
        ></app-history>

      </div>

    </div>
  `,
})
export class AdminComponent {
  tab: "dashboard" | "history" = "dashboard";
}