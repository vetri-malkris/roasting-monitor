import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Batch,
  BatchRequest,
  MaterialRequest,
  RawMaterial,
  UserSession,
} from "../models/models";
@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  private base = "http://localhost:8080/api";
  login(username: string, password: string) {
    return this.http.post<UserSession>(`${this.base}/auth/login`, {
      username,
      password,
    });
  }
  materials() {
    return this.http.get<RawMaterial[]>(`${this.base}/materials`);
  }
  addMaterial(r: MaterialRequest) {
    return this.http.post<RawMaterial>(`${this.base}/materials`, r);
  }
  batches(user?: string, mine = false) {
    let url = `${this.base}/batches?mine=${mine}`;
    if (user) url += `&username=${encodeURIComponent(user)}`;
    return this.http.get<Batch[]>(url);
  }
  create(r: BatchRequest, user: string) {
    return this.http.post<Batch>(`${this.base}/batches`, r, {
      headers: { "X-User": user },
    });
  }
  update(id: number, r: BatchRequest, user: string) {
    return this.http.put<Batch>(`${this.base}/batches/${id}`, r, {
      headers: { "X-User": user },
    });
  }
  delete(id: number) {
    return this.http.delete<void>(`${this.base}/batches/${id}`);
  }
  uploadMaterials(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return this.http.post(`${this.base}/materials/import`, formData);
  }
  downloadReport(from?: string, to?: string) {
    let url = `${this.base}/reports/excel`;

    const params: string[] = [];

    if (from) {
      params.push(`from=${encodeURIComponent(from)}`);
    }

    if (to) {
      params.push(`to=${encodeURIComponent(to)}`);
    }

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    return this.http.get(url, {
      responseType: "blob",
    });
  }
}
