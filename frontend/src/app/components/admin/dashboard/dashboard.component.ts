import {
  Component,
  inject,
  OnInit
} from "@angular/core";

import { FormsModule } from "@angular/forms";

import {
  DecimalPipe,
  NgFor,
  NgIf
} from "@angular/common";

import { ApiService } from "../../../services/api.service";

import {
  Batch,
  RawMaterial
} from "../../../models/models";

import * as XLSX from "xlsx";

import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";


@Component({
  selector: "app-dashboard",

  standalone: true,

  imports: [
    FormsModule,
    NgFor,
    NgIf,
    DecimalPipe
  ],

  templateUrl: "./dashboard.component.html",

  styleUrls: [
    "./dashboard.component.css"
  ]
})
export class DashboardComponent implements OnInit {

  api = inject(ApiService);


  // =====================================================
  // DATA
  // =====================================================

  batches: Batch[] = [];

  materials: RawMaterial[] = [];


  // =====================================================
  // DATE FILTER
  // =====================================================

  from = "";

  to = "";


  // =====================================================
  // ADD MATERIAL
  // =====================================================

  showAdd = false;

  name = "";

  qty: number | null = null;

  std: number | null = 20;

  batchNumber = "";

  supplier = "";


  // =====================================================
  // ERRORS
  // =====================================================

  error = "";

  importError = "";

  // =====================================================
  // TOASTER
  // =====================================================

  toastMessage = "";
  toastVisible = false;
  toastType: "success" | "error" = "success";
  private toastTimer: ReturnType<typeof setTimeout> | null = null;


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.load();
  }


  // =====================================================
  // LOAD DATA
  // =====================================================

  load(): void {

    this.error = "";

    this.api.materials().subscribe({

      next: (data) => {
        this.materials = data;
      },

      error: () => {
        this.error =
          "Unable to load raw materials.";
      }

    });


    this.api.batches().subscribe({

      next: (data) => {
        this.batches = data;
      },

      error: () => {
        this.error =
          "Unable to load roasting batches.";
      }

    });

  }


  // =====================================================
  // FILTERED BATCHES
  // =====================================================

  get filtered(): Batch[] {

    return this.batches.filter((b) => {

      const date =
        b.createdAt
          ? b.createdAt.slice(0, 10)
          : "";

      const fromOk =
        !this.from ||
        date >= this.from;

      const toOk =
        !this.to ||
        date <= this.to;

      return fromOk && toOk;

    });

  }


  // =====================================================
  // SUMMARY CALCULATIONS
  //
  // POC:
  //
  // Input = total input
  //
  // Standard Loss = total standard loss
  //
  // Expected Output =
  // Input - Standard Loss
  //
  // Actual Output =
  // total actual output
  //
  // Loss =
  // Input - Actual Output
  //
  // Loss Variance =
  // Actual Loss - Standard Loss
  // =====================================================

  get summary() {

    const data =
      this.filtered;


    const input =
      data.reduce(
        (total, batch) =>
          total +
          Number(batch.inputQty || 0),
        0
      );


    const output =
      data.reduce(
        (total, batch) =>
          total +
          Number(batch.outputQty || 0),
        0
      );


    const standardLossKg =
      data.reduce(
        (total, batch) =>
          total +
          Number(batch.stdLossKg || 0),
        0
      );


    const loss =
      input - output;


    const expectedOutput =
      input - standardLossKg;


    const yieldPct =
      input > 0
        ? (output / input) * 100
        : 0;


    const lossPct =
      input > 0
        ? (loss / input) * 100
        : 0;


    const standardLossPct =
      input > 0
        ? (standardLossKg / input) * 100
        : 0;


    const varianceKg =
      Math.abs(
        loss - standardLossKg
      );


    const variancePct =
      input > 0
        ? Math.abs(
            ((loss - standardLossKg) / input) * 100
          )
        : 0;


    const variance =
      input > 0
        ? ((loss - standardLossKg) / input) * 100
        : 0;


    const expectedOutputPct =
      input > 0
        ? (expectedOutput / input) * 100
        : 0;


    return {

      count: data.length,

      i: input,

      o: output,

      sl: standardLossKg,

      loss,

      expectedOutput,

      expectedOutputPct,

      y: yieldPct,

      l: lossPct,

      standardLossPct,

      v: variance,

      varianceKg,

      variancePct

    };

  }


  // =====================================================
  // APPLY FILTER
  // =====================================================

  applyFilter(): void {

    /*
     * The summary getter automatically recalculates
     * when from/to changes.
     *
     * This method exists so the Apply button behaves
     * naturally from the UI.
     */

  }


  // =====================================================
  // CLEAR FILTER
  // =====================================================

  clearFilter(): void {

    this.from = "";

    this.to = "";

  }


  // =====================================================
  // ADD MATERIAL FORM
  // =====================================================

  toggleAddForm(): void {

    this.error = "";

    this.showAdd =
      !this.showAdd;

  }


  cancelAdd(): void {

    this.showAdd = false;

    this.resetMaterialForm();

  }


  // =====================================================
  // ADD MATERIAL
  // =====================================================

  add(): void {

    this.error = "";


    if (!this.name.trim()) {

      this.error =
        "Enter material name.";

      return;

    }


    if (
      this.qty === null ||
      this.qty <= 0
    ) {

      this.error =
        "Enter a valid quantity.";

      return;

    }


    if (
      this.std === null ||
      this.std < 0 ||
      this.std > 100
    ) {

      this.error =
        "Enter a valid standard loss percentage.";

      return;

    }


    this.api.addMaterial({

      name:
        this.name.trim(),

      quantity:
        this.qty,

      standardLossPct:
        this.std,

      batchNumber:
        this.batchNumber.trim(),

      supplier:
        this.supplier.trim()

    }).subscribe({

      next: () => {

        this.showAdd = false;

        this.resetMaterialForm();

        this.load();

      },

      error: (e) => {

        this.error =
          e?.error?.message ||
          "Unable to add material.";

      }

    });

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  private resetMaterialForm(): void {

    this.name = "";

    this.qty = null;

    this.std = 20;

    this.batchNumber = "";

    this.supplier = "";

  }


  // =====================================================
  // IMPORT EXCEL
  // =====================================================

  importExcel(event: Event): void {
    this.importError = "";
    this.error = "";

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      this.importError = "Please select an Excel file (.xlsx or .xls).";
      input.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = reader.result;

        if (!data) {
          throw new Error("Unable to read Excel file.");
        }

        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames.length) {
          throw new Error("Excel file does not contain a worksheet.");
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!firstSheet) {
          throw new Error("Excel file does not contain a worksheet.");
        }

        const rows = XLSX.utils.sheet_to_json<any>(firstSheet, { defval: "" });

        if (!rows.length) {
          throw new Error("Excel file is empty.");
        }

        let invalidCount = 0;

        const requests = rows
          .map((row) => {
            const name = String(
              row.Name ?? row.name ?? row.Material ?? row.material ?? ""
            ).trim();

            const quantityValue =
              row.Quantity ??
              row.quantity ??
              row["Quantity (kg)"] ??
              row.qty;

            const standardValue =
              row["Standard Loss %"] ??
              row["Standard Loss"] ??
              row["Std. Loss"] ??
              row.standardLossPct ??
              row.standardLoss ??
              row.std;

            const batch = String(
              row["Batch Number"] ?? row.batchNumber ?? row.Batch ?? ""
            ).trim();

            const supplierName = String(
              row.Supplier ?? row.supplier ?? ""
            ).trim();

            const quantity = Number(quantityValue);
            const standardLoss = Number(standardValue);

            if (
              !name ||
              !Number.isFinite(quantity) ||
              quantity <= 0 ||
              !Number.isFinite(standardLoss) ||
              standardLoss < 0 ||
              standardLoss > 100
            ) {
              invalidCount++;
              return null;
            }

            return this.api.addMaterial({
              name,
              quantity,
              standardLossPct: standardLoss,
              batchNumber: batch,
              supplier: supplierName
            });
          })
          .filter(
            (request): request is ReturnType<ApiService["addMaterial"]> =>
              request !== null
          );

        if (!requests.length) {
          throw new Error(
            "No valid material rows found. Required columns: Name, Quantity, Standard Loss %."
          );
        }

        // Wait for every valid row. One failed row will not stop the others.
        forkJoin(
          requests.map((request) => request.pipe(catchError(() => of(null))))
        ).subscribe({
          next: (results) => {
            const successCount = results.filter((result) => result !== null).length;
            const apiFailedCount = results.length - successCount;
            const failedCount = invalidCount + apiFailedCount;

            this.load();

            if (failedCount === 0) {
              this.importError = "";
              this.showToast(
                `${successCount} material(s) imported successfully.`,
                "success"
              );
            } else if (successCount > 0) {
              this.importError = "";
              this.showToast(
                `${successCount} material(s) imported successfully. ${failedCount} row(s) failed.`,
                "error"
              );
            } else {
              this.importError =
                "No materials were imported. Please check the Excel data.";
              this.showToast(
                "Excel import failed. No materials were added.",
                "error"
              );
            }
          },
          error: () => {
            this.importError = "Unable to import Excel file.";
            this.showToast("Unable to import Excel file.", "error");
          }
        });
      } catch (e) {
        this.importError =
          e instanceof Error ? e.message : "Unable to import Excel file.";
        this.showToast(this.importError, "error");
      }
    };

    reader.onerror = () => {
      this.importError = "Unable to read Excel file.";
      this.showToast(this.importError, "error");
    };

    reader.readAsArrayBuffer(file);

    // Allows the same Excel file to be selected again.
    input.value = "";
  }

  // =====================================================
  // TOASTER
  // =====================================================

  private showToast(
    message: string,
    type: "success" | "error" = "success"
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 3500);
  }

  // =====================================================
  // DOWNLOAD REPORT
  // =====================================================

  downloadReport(): void {

    const data =
      this.filtered;


    if (!data.length) {

      this.error =
        "There are no batches available for the selected date range.";

      return;

    }


    const rows =
      data.map((batch) => {

        const input =
          Number(
            batch.inputQty || 0
          );


        const output =
          Number(
            batch.outputQty || 0
          );


        const standardLoss =
          Number(
            batch.stdLossKg || 0
          );


        const loss =
          input - output;


        const expectedOutput =
          input - standardLoss;


        const yieldPct =
          input > 0
            ? (output / input) * 100
            : 0;


        const lossPct =
          input > 0
            ? (loss / input) * 100
            : 0;


        const standardLossPct =
          input > 0
            ? (standardLoss / input) * 100
            : 0;


        const varianceKg =
          loss - standardLoss;


        const variancePct =
          input > 0
            ? (varianceKg / input) * 100
            : 0;


        return {

          "Batch Number":
            batch.batchNo,

          "Material":
            batch.material,

          "Quantity In (kg)":
            input,

          "Expected Output (kg)":
            Number(
              expectedOutput.toFixed(2)
            ),

          "Actual Output (kg)":
            output,

          "Actual Yield (%)":
            Number(
              yieldPct.toFixed(2)
            ),

          "Loss (kg)":
            Number(
              loss.toFixed(2)
            ),

          "Loss (%)":
            Number(
              lossPct.toFixed(2)
            ),

          "Standard Loss (kg)":
            Number(
              standardLoss.toFixed(2)
            ),

          "Standard Loss (%)":
            Number(
              standardLossPct.toFixed(2)
            ),

          "Loss Variance (kg)":
            Number(
              varianceKg.toFixed(2)
            ),

          "Loss Variance (%)":
            Number(
              variancePct.toFixed(2)
            ),

          "Date":
            batch.createdAt,

          "Created By":
            batch.createdBy,

          "Remarks":
            batch.remarks || ""

        };

      });


    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );


    worksheet["!cols"] = [

      { wch: 15 },
      { wch: 30 },
      { wch: 18 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 24 },
      { wch: 18 },
      { wch: 40 }

    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Roasting Report"
    );


    const summary =
      this.summary;


    const summaryRows = [

      {
        "Metric": "Batches",
        "Value":
          summary.count
      },

      {
        "Metric": "Input (kg)",
        "Value":
          Number(
            summary.i.toFixed(2)
          )
      },

      {
        "Metric": "Expected Output (kg)",
        "Value":
          Number(
            summary.expectedOutput.toFixed(2)
          )
      },

      {
        "Metric": "Actual Output (kg)",
        "Value":
          Number(
            summary.o.toFixed(2)
          )
      },

      {
        "Metric": "Actual Yield (%)",
        "Value":
          Number(
            summary.y.toFixed(2)
          )
      },

      {
        "Metric": "Loss (kg)",
        "Value":
          Number(
            summary.loss.toFixed(2)
          )
      },

      {
        "Metric": "Loss (%)",
        "Value":
          Number(
            summary.l.toFixed(2)
          )
      },

      {
        "Metric": "Standard Loss (kg)",
        "Value":
          Number(
            summary.sl.toFixed(2)
          )
      },

      {
        "Metric": "Standard Loss (%)",
        "Value":
          Number(
            summary.standardLossPct.toFixed(2)
          )
      },

      {
        "Metric": "Loss Variance (kg)",
        "Value":
          Number(
            (
              summary.loss -
              summary.sl
            ).toFixed(2)
          )
      },

      {
        "Metric": "Loss Variance (%)",
        "Value":
          Number(
            summary.v.toFixed(2)
          )
      }

    ];


    const summarySheet =
      XLSX.utils.json_to_sheet(
        summaryRows
      );


    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Summary"
    );


    const today =
      new Date()
        .toISOString()
        .slice(0, 10);


    XLSX.writeFile(
      workbook,
      `roasting-report-${today}.xlsx`
    );

  }

}