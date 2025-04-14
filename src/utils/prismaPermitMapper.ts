// utils/permitUtils.ts

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

/**
 * Creates a resource object for Permit based on the operation
 */
export function createResourceObject(
  resourceType: string,
  args: any,
  operation: string
): any {
  // For operations that target a specific record (e.g., update, delete)
  if (
    ["findUnique", "findUniqueOrThrow", "update", "upsert", "delete"].includes(
      operation
    )
  ) {
    const id = getResourceId(args.where);
    if (id !== undefined) {
      return { type: resourceType, key: id };
    }
  }
  return resourceType;
}

/**
 * Extracts the resource ID from the Prisma query args
 */
export function getResourceId(where: any): string | number | undefined {
  if (!where) return undefined;

  if (where.id !== undefined) {
    return where.id;
  }

  for (const key in where) {
    if (typeof where[key] !== "object") {
      return where[key];
    }
  }

  return undefined;
}
