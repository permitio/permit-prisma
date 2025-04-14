export type User = string | { key: string; attributes?: Record<string, any> };
export type Action = string;
export type Resource =
  | string
  | {
      type: string;
      key?: string;
      tenant?: string;
      attributes?: Record<string, any>;
    };
export type Context = Record<string, any>;

export interface CheckResult {
  allowed: boolean;
  reason?: string;
}

export enum AccessControlModel {
  RBAC = "rbac",
  ABAC = "abac",
  ReBAC = "rebac",
}
