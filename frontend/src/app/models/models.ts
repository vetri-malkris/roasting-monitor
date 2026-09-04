export type Role='operator'|'admin';
export interface UserSession {id:number; username:string; role:Role; label:string;}
export interface RawMaterial {id:number; name:string; quantity:number; standardLossPct:number; batchNumber?:string|null; supplier?:string|null;}
export interface Batch {id:number; batchNo:string; material:string; inputQty:number; outputQty:number; loss:number; lossPct:number; yieldPct:number; stdLossKg:number; stdLossPct:number; expectedOutputKg:number; varianceKg:number; variancePct:number; remarks?:string|null; createdAt:string; createdBy:string;}
export interface BatchRequest {material:string; inputQty:number; outputQty:number; remarks?:string;}
export interface MaterialRequest {name:string; quantity:number; standardLossPct:number; batchNumber?:string; supplier?:string;}
