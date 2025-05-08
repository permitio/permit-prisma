import { IPermitClient } from "../types/IPermitClient";
import { IPermitConfig } from "../types/IPermitConfig";
import { User, Action, Resource, Context } from "../models/PermissionModels";
import { PermitError } from "../utils/error";
import { Permit } from "permitio";
import logger from "../utils/logger";

export class PermitClient implements IPermitClient {
  private permitInstance: Permit;
  private config: IPermitConfig;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: IPermitConfig) {
    this.config = config;

    this.permitInstance = new Permit({
      token: config.token,
      pdp: config.pdp,
      apiUrl: config.apiUrl,
      log: config.debug
        ? {
            level: "debug",
          }
        : undefined,
      throwOnError: Boolean(config.throwOnError),
    });

    this.initializationPromise = this.initialize();
  }

  /**
   * Initialize the Permit SDK connection
   * This is called automatically when the client is constructed
   */
  private async initialize(): Promise<void> {
    try {
      await this.permitInstance.api.tenants.list();
      this.initialized = true;

      if (this.config.debug) {
        logger.info("Permit SDK initialized successfully");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (this.config.debug) {
        logger.error(`Failed to initialize SDK: ${errorMessage}`);
      }
      this.initialized = false;
    }
  }

  /**
   * Ensure the SDK is initialized before performing operations
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
      this.initializationPromise = null;
    }

    if (!this.initialized) {
      const error = new PermitError("Permit SDK is not properly initialized");
      if (this.config.throwOnError) {
        throw error;
      }
      if (this.config.debug) {
        logger.error("[Permit] Operation attempted but SDK is not initialized");
      }
    }
  }

  /**
   * Check if a user has permission to perform an action on a resource
   */

  async check(
    user: User,
    action: Action,
    resource: Resource,
    context?: Context
  ): Promise<boolean> {
    try {
      await this.ensureInitialized();

      if (this.config.debug) {
        logger.info(
          `[Permit] Checking permission for user=${
            typeof user === "string" ? user : JSON.stringify(user)
          }, action=${action}, resource=${
            typeof resource === "string" ? resource : JSON.stringify(resource)
          }`
        );
      }

      const allowed = await this.permitInstance.check(
        user,
        action,
        resource,
        context
      );

      if (this.config.debug) {
        logger.info(`Permission result: ${allowed ? "ALLOWED" : "DENIED"}`);
      }

      return allowed;
    } catch (error) {
      const errorCause =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = `Permission check failed: ${errorCause.message}`;

      if (this.config.debug) {
        logger.error(`[Permit] ${errorMessage}`);
      }

      if (this.config.throwOnError) {
        throw new PermitError(errorMessage, { cause: errorCause });
      }

      return false;
    }
  }

  /**
   * Enforce permission check - throws if permission is denied
   */
  async enforceCheck(
    user: User,
    action: Action,
    resource: Resource,
    context?: Context
  ): Promise<void> {
    const allowed = await this.check(user, action, resource, context);

    if (!allowed) {
      const userStr = typeof user === "string" ? user : user.key;
      const resourceStr =
        typeof resource === "string"
          ? resource
          : `${resource.type}${resource.key ? `:${resource.key}` : ""}`;

      const errorMessage = `Permission denied: User ${userStr} is not allowed to ${action} on ${resourceStr}`;

      if (this.config.debug) {
        logger.error(`[Permit] ${errorMessage}`);
      }

      throw new PermitError(errorMessage);
    }
  }

  async getUserPermissions(userId: string) {
    return this.permitInstance.getUserPermissions(userId);
  }

  async getAllowedResourceIds(
    userId: User,
    resourceType: string,
    action: Action
  ): Promise<string[]> {
    await this.ensureInitialized();

    const userKey = typeof userId === "string" ? userId : userId.key;
    const permissions = await this.getUserPermissions(userKey);

    if (this.config.debug) {
      logger.info(
        `Fetched permissions for ${userId}: ${JSON.stringify(permissions)}`
      );
    }

    const allowedKeys: string[] = [];
    for (const [key, data] of Object.entries(
      permissions as Record<string, any>
    )) {
      const [type, id] = key.split(":");
      if (
        type === resourceType &&
        data.permissions.includes(`${resourceType}:${action}`)
      ) {
        allowedKeys.push(id);
      }
    }

    return allowedKeys;
  }

  async filterObjects(
    user: User,
    action: Action,
    resources: Array<any>
  ): Promise<Array<any>> {
    await this.ensureInitialized();
    
    const checkRequests = resources.map(resource => ({
      user: user,
      action: action,
     resource: `${resource.type}:${resource.id}`,
     context: {
      resourceAttributes: resource.attributes
    }
    }));

    const results = await this.permitInstance.bulkCheck(checkRequests);
    
    const allowedResources = resources.filter((resource, index) => results[index]);
    
    return allowedResources;
  }

  async syncResourceInstanceCreate(
    resourceType: string,
    resourceKey: string,
    tenant: string = "default",
    attributes: Record<string, any> = {}
  ) {
    await this.ensureInitialized();

    const instanceData = {
      resource: resourceType,
      key: resourceKey,
      tenant,
      attributes,
    };

    try {
      const result = await this.permitInstance.api.resourceInstances.create(
        instanceData
      );
      if (this.config.debug) {
        logger.info(
          `Synced resource instance: ${resourceType}:${resourceKey} to Permit`
        );
      }
      return result;
    } catch (error: any) {
      logger.error(
        `Failed to sync resource instance ${resourceType}:${resourceKey}: ${error.message}`
      );
      throw error;
    }
  }

  async syncResourceInstanceUpdate(
    resourceType: string,
    resourceKey: string,
    tenant: string = "default",
    attributes: Record<string, any> = {}
  ) {
    await this.ensureInitialized();

    const instanceData = {
      attributes,
    };

    const instanceKey = `${resourceType}:${resourceKey}`;

    try {
      const result = await this.permitInstance.api.resourceInstances.update(
        instanceKey,
        instanceData
      );
      if (this.config.debug) {
        logger.info(`Updated resource instance: ${instanceKey} in Permit`);
      }
      return result;
    } catch (error: any) {
      logger.error(
        `Failed to update resource instance ${instanceKey}: ${error.message}`
      );
      throw error;
    }
  }

  async syncResourceInstanceDelete(
    resourceType: string,
    resourceKey: string
  ): Promise<void> {
    await this.ensureInitialized();

    const instanceKey = `${resourceType}:${resourceKey}`;

    try {
      await this.permitInstance.api.resourceInstances.delete(instanceKey);
      if (this.config.debug) {
        logger.info(`Deleted resource instance: ${instanceKey} from Permit`);
      }
    } catch (error: any) {
      logger.error(
        `Failed to delete resource instance ${instanceKey}: ${error.message}`
      );
      throw error;
    }
  }
  /**
   * Get the underlying Permit SDK instance for advanced usage
   */
  getPermitInstance(): Permit {
    return this.permitInstance;
  }
}
