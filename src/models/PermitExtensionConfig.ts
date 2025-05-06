import { IPermitConfig } from "../types/IPermitConfig";
import { AccessControlModel } from "./PermissionModels";

export interface PermitExtensionConfig {
  permitConfig: IPermitConfig;
  enableAutomaticChecks?: boolean;
  enableAutoSync?: boolean;
  enableDataFiltering?: boolean;
  defaultTenant?: string;
  resourceTypeMapping?: Record<string, string>;
  accessControlModel?: AccessControlModel;
  excludedModels?: string[];
  excludedOperations?: string[];
}
