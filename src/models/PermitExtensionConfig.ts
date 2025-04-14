import { IPermitConfig } from "../types/IPermitConfig";
import { AccessControlModel } from "./PermissionModels";

export interface PermitExtensionConfig {
  permitConfig: IPermitConfig;
  enableAutoSync?: boolean;
  defaultTenant?: string;
  resourceTypeMapping?: Record<string, string>;
  contextEnricher?: (
    modelName: string,
    operation: string,
    args: any
  ) => Record<string, any>;
  debug?: boolean;
  enableAutomaticChecks?: boolean;
  accessControlModel?: AccessControlModel;
  excludedModels?: string[];
  excludedOperations?: string[];
  transactionAware?: boolean;
}
