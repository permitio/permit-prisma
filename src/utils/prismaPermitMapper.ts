import { AccessControlModel } from "../models/PermissionModels";

/**
 * Maps Prisma query operations to Permit.io permission action names.
 * This function translates Prisma's operation types (like findMany, create, etc.)
 * into standardized action names used in Permit.io authorization checks.
 *
 * @param {string} operation - The Prisma operation name (e.g., "findMany", "create", "update")
 * @returns {string} The corresponding Permit.io action name (e.g., "read", "create", "update")
 * 
 * @example
 * mapOperationToAction("findMany") // Returns "read"
 * mapOperationToAction("create")   // Returns "create"
 * mapOperationToAction("upsert")   // Returns "update"
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
 * Maps Prisma model names to Permit.io resource types.
 * This function converts Prisma model names (typically PascalCase) to Permit.io 
 * resource type identifiers (typically snake_case) unless a custom mapping is provided.
 *
 * @param {string} model - The Prisma model name (e.g., "User", "BlogPost")
 * @param {Record<string, string>} [mapping] - Optional custom mapping from model names to resource types
 * @returns {string} The corresponding Permit.io resource type identifier
 * 
 * @example
 * // Without mapping
 * mapModelToResourceType("UserProfile") // Returns "user_profile"
 * 
 * // With custom mapping
 * const mapping = { "User": "customer" };
 * mapModelToResourceType("User", mapping) // Returns "customer"
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

/**
 * Creates a properly formatted resource object for Permit.io permission checks
 * based on the access control model being used.
 *
 * @param {string} resourceType - The Permit.io resource type (e.g., "document", "user")
 * @param {any} args - Prisma query arguments containing data and/or where clauses
 * @param {string} operation - The Prisma operation being performed (e.g., "create", "update")
 * @param {AccessControlModel} [modelType] - The access control model (RBAC, ABAC, or ReBAC)
 * @returns {string|object} A formatted resource object compatible with Permit.io checks
 * 
 * @example
 * // No model type or RBAC - simple string
 * createResourceObject("document", {}, "read")
 * // Returns: "document"
 * 
 * // ABAC - object with attributes
 * createResourceObject("document", { data: { confidential: true }}, "create", AccessControlModel.ABAC)
 * // Returns: { type: "document", attributes: { confidential: true }}
 * 
 * // ReBAC - object with resource ID and attributes
 * createResourceObject("document", { where: { id: "123" }}, "update", AccessControlModel.ReBAC)
 * // Returns: { type: "document", key: "123", attributes: {...} }
 */
export function createResourceObject(
  resourceType: string,
  args: any,
  operation: string,
  modelType?: AccessControlModel
): any {
  if (modelType === AccessControlModel.RBAC) {
    return resourceType;
  }

  if (modelType === AccessControlModel.ABAC) {
    return {
      type: resourceType,
      attributes: extractAttributes(args),
    };
  }

  if (modelType === AccessControlModel.ReBAC) {
    const key = getResourceId(args?.where);
    const attributes = extractAttributes(args);

    return {
      type: resourceType,
      ...(key !== undefined && { key }),
      ...(attributes && Object.keys(attributes).length > 0 && { attributes }),
    };
  }

  return resourceType;
}

/**
 * Extracts the resource ID from the Prisma query args
 */
export function getResourceId(where: any): string | number | undefined {
  if (!where || typeof where !== "object") return undefined;

  if (where.id !== undefined) {
    return where.id;
  }

  for (const key in where) {
    const value = where[key];
    if (typeof value !== "object" && value !== undefined) {
      return value;
    }
  }

  return undefined;
}

export function getResourceIdForSync(
  result: any,
  operation: string
): string | null {
  if (!result) return null;

  if (
    operation === "create" ||
    operation === "update" ||
    operation === "delete"
  ) {
    if (result.id) return String(result.id);
    if (Array.isArray(result) && result.length > 0 && result[0].id)
      return String(result[0].id);
  }

  return null;
}


/**
 * Extracts attributes from Prisma query arguments to be used in ABAC/ReBAC permission checks.
 * This function attempts to extract meaningful data attributes from either the `data` object 
 * (in create/update operations) or the `where` object (in read/delete operations).
 *
 * @param {any} args - The Prisma query arguments object
 * @returns {Record<string, any>} An object containing extracted attributes, or an empty object if no attributes found
 * 
 * @example
 * // From create/update operation
 * extractAttributes({ data: { title: "Document", confidential: true }})
 * // Returns: { title: "Document", confidential: true }
 * 
 * // From read/delete operation
 * extractAttributes({ where: { id: "123", status: "active" }})
 * // Returns: { id: "123", status: "active" }
 * 
 * // When no relevant data is found
 * extractAttributes({})
 * // Returns: {}
 */
export function extractAttributes(args: any): Record<string, any> {
  if (!args) return {};

  if (args.data && typeof args.data === "object") {
    return { ...args.data };
  }

  if (args.where && typeof args.where === "object") {
    return { ...args.where };
  }

  return {};
}
