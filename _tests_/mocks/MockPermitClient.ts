import { IPermitClient } from "../../src/types/IPermitClient";
import { PermitError } from "../../src/utils/error";
import { User, Action, Resource, Context } from "../../src/models/PermissionModels";

/**
 * A mock implementation of IPermitClient for testing purposes
 */
export class MockPermitClient implements IPermitClient {
  private allowedActions: Set<string> = new Set();
  
  // Record calls for test assertions
  public callHistory: Array<{
    user: User, 
    action: Action, 
    resource: Resource, 
    context?: Context
  }> = [];

  constructor(config?: { allowedActions?: string[] }) {
    if (config?.allowedActions) {
      this.allowedActions = new Set(config.allowedActions);
    }
  }
  
  /**
   * Set which actions should be allowed by the mock client
   */
  setAllowedActions(actions: string[]) {
    this.allowedActions = new Set(actions);
  }

  /**
   * Add a specific permission to allow
   */
  allowAction(resourceType: string, action: string) {
    this.allowedActions.add(`${resourceType}:${action}`);
  }

  /**
   * Clear all recorded calls
   */
  clearHistory() {
    this.callHistory = [];
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
    // Record this call
    this.callHistory.push({ user, action, resource, context });
    
    // Simple permission logic
    const resourceType = typeof resource === 'string' ? resource : resource.type;
    const key = `${resourceType}:${action}`;
    return this.allowedActions.has(key);
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
      const userStr = typeof user === 'string' ? user : user.key;
      const resourceStr = typeof resource === 'string' 
        ? resource 
        : `${resource.type}${resource.key ? `:${resource.key}` : ''}`;
      
      throw new PermitError(`Permission denied: User ${userStr} is not allowed to ${action} on ${resourceStr}`);
    }
  }
}