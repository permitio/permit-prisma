// utils/permitUtils.ts

import { AccessControlModel } from "../models/PermissionModels";

/**
 * Maps Prisma operations to Permit actions
 */
export function mapOperationToAction(operation: string): string {
  switch (operation) {
    case "findUnique":
    case "findUniqueOrThrow":
    case "findFirst":
    case "findFirstOrThrow":
    case "findMany":
      return "read";
    case "create":
    case "createMany":
      return "create";
    case "update":
    case "updateMany":
      return "update";
    case "upsert":
      return "update";
    case "delete":
    case "deleteMany":
      return "delete";
    default:
      return operation;
  }
}

/**
 * Maps Prisma model names to Permit resource types
 */
export function mapModelToResourceType(
  model: string,
  mapping?: Record<string, string>
): string {
  if (mapping && mapping[model]) {
    return mapping[model];
  }
  return model.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export function createResourceObject(
  resourceType: string,
  args: any,
  operation: string,
  modelType?: AccessControlModel
): any {
  // RBAC: Only care about the resource type
  if (modelType === AccessControlModel.RBAC) {
    return resourceType;
  }

  // ABAC: Include attributes only
  if (modelType === AccessControlModel.ABAC) {
    return {
      type: resourceType,
      attributes: extractAttributes(args),
    };
  }

  // ReBAC (or ReBAC + ABAC): Include key and attributes
  if (modelType === AccessControlModel.ReBAC) {
    const key = getResourceId(args?.where);
    const attributes = extractAttributes(args);

    return {
      type: resourceType,
      ...(key !== undefined && { key }),
      ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
    };
  }

  // Fallback (treat as RBAC if modelType is undefined)
  return resourceType;
}

/**
 * Extracts the resource ID from the Prisma query args
 */
export function getResourceId(where: any): string | number | undefined {
  if (!where || typeof where !== "object") return undefined;

  // First, check for common 'id' field
  if (where.id !== undefined) {
    return where.id;
  }

  // Try to extract the first primitive value (e.g., { slug: 'abc' })
  for (const key in where) {
    const value = where[key];
    if (typeof value !== "object" && value !== undefined) {
      return value;
    }
  }

  return undefined;
}

/**
 * Extract attributes from args.data or args.where (for ABAC/ReBAC checks)
 */
export function extractAttributes(args: any): Record<string, any> {
  if (!args) return {};

  // Prefer data if it exists (e.g., for create, update)
  if (args.data && typeof args.data === "object") {
    return { ...args.data };
  }

  // Fallback to where (e.g., for findUnique or delete with filters)
  if (args.where && typeof args.where === "object") {
    return { ...args.where };
  }

  return {};
}
