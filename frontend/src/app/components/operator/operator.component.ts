import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DecimalPipe, DatePipe, NgFor, NgIf } from "@angular/common";
import { ApiService } from "../../services/api.service";
import { SessionService } from "../../core/session.service";
import { Batch, RawMaterial } from "../../models/models";
@Component({
  selector: "app-operator",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DecimalPipe, DatePipe],
  templateUrl: "./operator.component.html",
})
export class OperatorComponent implements OnInit {
  api = inject(ApiService);
  session = inject(SessionService);
  materials: RawMaterial[] = [];
  batches: Batch[] = [];
  material = "";
  inputQty: number | null = null;
  outputQty: number | null = null;
  remarks = "";
  expanded = new Set<number>();
  error = "";
  ngOnInit() {
    this.load();
  }
  load() {
    this.api.materials().subscribe((x) => (this.materials = x));
    this.api
      .batches(this.session.user()!.username, true)
      .subscribe((x) => (this.batches = x));
  }
  get m() {
    return this.materials.find((x) => x.name === this.material);
  }
  get calc() {
    if (!this.m || !this.inputQty || this.outputQty === null) return null;
    const i = this.inputQty,
      o = this.outputQty,
      std = this.m.standardLossPct,
      stdKg = +((i * std) / 100).toFixed(2),
      loss = +(i - o).toFixed(2),
      yieldPct = +((o / i) * 100).toFixed(2),
      lossPct = +((loss / i) * 100).toFixed(2),
      variance = +(loss - stdKg).toFixed(2),
      variancePct = +(lossPct - std).toFixed(2);
    return {
      expected: i - stdKg,
      stdKg,
      loss,
      yieldPct,
      lossPct,
      variance,
      variancePct,
    };
  }
  save(): void {
    this.error = "";

    if (!this.material) {
      this.error = "Choose a raw material.";
      return;
    }

    if (!this.inputQty || this.inputQty <= 0) {
      this.error = "Enter how much went in.";
      return;
    }

    if (this.outputQty === null || this.outputQty < 0) {
      this.error = "Enter how much came out.";
      return;
    }

    if (this.outputQty > this.inputQty) {
      this.error = "The output can't be more than what went in.";
      return;
    }

    if (this.m && this.inputQty > this.m.quantity) {
      this.error =
        `Not enough ${this.material} in stock ` +
        `(${this.m.quantity} kg available).`;
      return;
    }

    this.api
      .create(
        {
          material: this.material,
          inputQty: this.inputQty,
          outputQty: this.outputQty,
          remarks: this.remarks,
        },
        this.session.user()!.username,
      )
      .subscribe({
        next: () => {
          this.inputQty = null;
          this.outputQty = null;
          this.remarks = "";
          this.material = "";
          this.load();
        },
        error: (e) => {
          this.error = e.error?.message || "Unable to save batch.";
        },
      });
  }
  toggle(id: number) {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }
}
