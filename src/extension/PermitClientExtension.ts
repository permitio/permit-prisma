import { Prisma } from "@prisma/client/extension";
import { PermitClient } from "../client/PermitClient";
import { PermitExtensionConfig } from "../models/PermitExtensionConfig";
import { IPermitClient } from "../types/IPermitClient";
import { User, Action, Resource, Context } from "../models/PermissionModels";
import { PermitError } from "../utils/error";
import {
  mapOperationToAction,
  mapModelToResourceType,
  createResourceObject,
} from "../utils/prismaPermitMapper";

export function createPermitClientExtension(config: PermitExtensionConfig) {
  const permitClient = new PermitClient(config.permitConfig);
  let currentUser: User | undefined;

  return Prisma.defineExtension({
    name: "permit-prisma",
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
      },
    },
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          if (!config.enableAutomaticChecks) {
            return query(args);
          }

          console.log("🎉 config", model, query, operation, args);
          if (config.debug) {
            console.log(
              `[Permit] Intercepting ${operation} operation on ${model}`
            );
          }

          const user = currentUser;

          if (!user) {
            if (config.debug) {
              console.log(
                `[Permit] No user provided, skipping permission check`
              );
            }
            return query(args);
          }

          if (
            config.excludedModels?.includes(model) ||
            config.excludedOperations?.includes(operation)
          ) {
            if (config.debug) {
              console.log(
                `[Permit] Skipping excluded model/operation: ${model}/${operation}`
              );
            }
            return query(args);
          }

          const action = mapOperationToAction(operation);
          const resourceType = mapModelToResourceType(
            model,
            config.resourceTypeMapping
          );

          const resource = createResourceObject(resourceType, args, operation);

          const enrichedContext = config.contextEnricher
            ? config.contextEnricher(model, operation, args)
            : {};

          if (config.debug) {
            console.log(
              `[Permit] Checking permission: ${
                typeof user === "string" ? user : JSON.stringify(user)
              } -> ${action} -> ${
                typeof resource === "string"
                  ? resource
                  : JSON.stringify(resource)
              }`
            );
          }

          const allowed = await permitClient.check(
            user,
            action,
            resource,
            enrichedContext
          );

          if (!allowed) {
            const userStr = typeof user === "string" ? user : user.key;
            const resourceStr =
              typeof resource === "string"
                ? resource
                : `${resource.type}${resource.key ? `:${resource.key}` : ""}`;
            const errorMessage = `Permission denied: User ${userStr} is not allowed to perform ${action} operation on ${resourceStr} resource`;

            if (config.debug) {
              console.log(`[Permit] ${errorMessage}`);
            }
            throw new PermitError(errorMessage);
          }

          return query(args);
        },
      },
    },
  });
}
