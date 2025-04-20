import { Prisma } from "@prisma/client/extension";
import { PermitClient } from "../client/PermitClient";
import { PermitExtensionConfig } from "../models/PermitExtensionConfig";
import { IPermitClient } from "../types/IPermitClient";
import {
  User,
  Action,
  Resource,
  Context,
  AccessControlModel,
} from "../models/PermissionModels";
import { PermitError } from "../utils/error";
import {
  mapOperationToAction,
  mapModelToResourceType,
  createResourceObject,
  getResourceIdForSync,
} from "../utils/prismaPermitMapper";
import logger from "../utils/logger";

export function createPermitClientExtension(config: PermitExtensionConfig) {
  const permitClient = new PermitClient(config.permitConfig);
  let currentUser: User | undefined;

  return Prisma.defineExtension({
    name: "prisma-permit",
    client: {
      $permit: {
        client: permitClient,
        async check(
          user: User,
          action: Action,
          resource: Resource,
          context?: Context
        ) {
          return permitClient.check(user, action, resource, context);
        },
        async enforceCheck(
          user: User,
          action: Action,
          resource: Resource,
          context?: Context
        ) {
          return permitClient.enforceCheck(user, action, resource, context);
        },
        setUser(user: User) {
          currentUser = user;
          return { $permitContext: { user } };
        },
        getPermitClient(): IPermitClient {
          return permitClient;
        },
        getConfig(): PermitExtensionConfig {
          return config;
        },
        async getAllowedResourceIds(
          userId: string,
          resourceType: string,
          action: Action
        ) {
          return permitClient.getAllowedResourceIds(
            userId,
            resourceType,
            action
          );
        },
      },
    },
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          if (!config.enableAutomaticChecks) {
            return query(args);
          }
          if (config.permitConfig.debug) {
            logger.info(
              `[Permit] Intercepting ${operation} operation on ${model}`
            );
          }

          const user = currentUser;

          if (!user) {
            if (config.permitConfig.debug) {
              logger.info(
                `[Permit] No user provided, skipping permission check`
              );
            }
            return query(args);
          }

          if (
            config.enableDataFiltering &&
            config.accessControlModel === AccessControlModel.ReBAC &&
            operation === "findMany"
          ) {
            const resourceType = mapModelToResourceType(
              model,
              config.resourceTypeMapping
            );
            const allowedIds = await permitClient.getAllowedResourceIds(
              user,
              resourceType,
              "read"
            );

            if (allowedIds.length === 0) {
              if (config.permitConfig.debug) {
                logger.info(
                  `[Permit] ReBAC filter: user has no access to any ${resourceType}`
                );
              }
              return [];
            }

            args.where = args.where
              ? { AND: [args.where, { id: { in: allowedIds } }] }
              : { id: { in: allowedIds } };

            if (config.permitConfig.debug) {
              logger.info(
                `[Permit] ReBAC filter applied to ${model}, allowed IDs: ${JSON.stringify(
                  allowedIds
                )}`
              );
            }

            return query(args);
          }

          if (
            config.excludedModels?.includes(model) ||
            config.excludedOperations?.includes(operation)
          ) {
            if (config.permitConfig.debug) {
              logger.info(
                `[Permit] Skipping excluded model/operation: ${model}/${operation}`
              );
            }
            return query(args);
          }

          // Perform check for RBAC/ABAC (before query)
          let action = mapOperationToAction(operation);
          const resourceType = mapModelToResourceType(
            model,
            config.resourceTypeMapping
          );
          let resource = createResourceObject(
            resourceType,
            args,
            operation,
            config.accessControlModel
          );

          if (config.accessControlModel !== AccessControlModel.ReBAC) {
            if (config.permitConfig.debug) {
              logger.info(
                `[Permit] Checking permission: ${
                  typeof user === "string" ? user : JSON.stringify(user)
                } -> ${action} -> ${
                  typeof resource === "string"
                    ? resource
                    : JSON.stringify(resource)
                }`
              );
            }

            const allowed = await permitClient.check(user, action, resource);
            if (!allowed) {
              const userStr = typeof user === "string" ? user : user.key;
              const resourceStr =
                typeof resource === "string"
                  ? resource
                  : `${resource.type}${resource.key ? `:${resource.key}` : ""}`;
              const errorMessage = `Permission denied: User ${userStr} is not allowed to perform ${action} operation on ${resourceStr} resource`;

              if (config.permitConfig.debug) {
                logger.info(`[Permit] ${errorMessage}`);
              }
              throw new PermitError(errorMessage);
            }
          }

          const result = await query(args);

          if (
            config.enableAutoSync &&
            config.accessControlModel === AccessControlModel.ReBAC &&
            ["create", "update", "delete"].includes(operation)
          ) {
            const resourceKey = getResourceIdForSync(result, operation);
            if (resourceKey) {
              resource = { type: resourceType, key: resourceKey };

              if (config.permitConfig.debug) {
                logger.info(
                  `[Permit] Checking ReBAC mutation permission: ${
                    typeof user === "string" ? user : JSON.stringify(user)
                  } -> ${action} -> ${JSON.stringify(resource)}`
                );
              }

              const allowed = await permitClient.check(user, action, resource);
              if (!allowed) {
                const userStr = typeof user === "string" ? user : user.key;
                const resourceStr = `${resource.type}:${resource.key}`;
                const errorMessage = `ReBAC Permission denied: User ${userStr} is not allowed to perform ${action} operation on ${resourceStr} resource`;

                if (config.permitConfig.debug) {
                  logger.info(`[Permit] ${errorMessage}`);
                }
                throw new PermitError(errorMessage);
              }
              const tenant = config.defaultTenant || "default";
              const attributes = (result as any)?.attributes || {};

              if (operation === "create") {
                await permitClient.syncResourceInstanceCreate(
                  resourceType,
                  resourceKey,
                  tenant,
                  attributes
                );
              } else if (operation === "update") {
                await permitClient.syncResourceInstanceUpdate(
                  resourceType,
                  resourceKey,
                  tenant,
                  attributes
                );
              } else if (operation === "delete") {
                await permitClient.syncResourceInstanceDelete(
                  resourceType,
                  resourceKey
                );
              }
            }
          }

          return result;
        },
      },
    },
  });
}
