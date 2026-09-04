import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgFor, NgIf, DecimalPipe, DatePipe } from "@angular/common";
import { ApiService } from "../../../services/api.service";
import { Batch, RawMaterial } from "../../../models/models";
@Component({
  selector: "app-history",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DecimalPipe, DatePipe],
  templateUrl: "./history.component.html",
})
export class HistoryComponent implements OnInit {
  api = inject(ApiService);
  batches: Batch[] = [];
  materials: RawMaterial[] = [];
  expanded = new Set<number>();
  editing: number | null = null;
  draft: Partial<Batch> = {};
  error = "";
  ngOnInit() {
    this.load();
  }
  load() {
    this.api.materials().subscribe((x) => (this.materials = x));
    this.api.batches().subscribe((x) => (this.batches = x));
  }
  toggle(id: number) {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }
  edit(b: Batch) {
    this.expanded.add(b.id);
    this.editing = b.id;
    this.draft = {
      material: b.material,
      inputQty: b.inputQty,
      outputQty: b.outputQty,
      remarks: b.remarks || "",
    };
  }
  save(b: Batch) {
    if (
      !this.draft.material ||
      this.draft.inputQty == null ||
      this.draft.outputQty == null
    )
      return;
    this.api
      .update(
        b.id,
        {
          material: this.draft.material,
          inputQty: +this.draft.inputQty,
          outputQty: +this.draft.outputQty,
          remarks: this.draft.remarks as string,
        },
        b.createdBy,
      )
      .subscribe({
        next: () => {
          this.editing = null;
          this.load();
        },
        error: (e) => (this.error = e.error?.message || "Unable to update."),
      });
  }
  remove(b: Batch) {
    if (confirm(`Delete ${b.batchNo}?`))
      this.api.delete(b.id).subscribe(() => this.load());
  }
}
