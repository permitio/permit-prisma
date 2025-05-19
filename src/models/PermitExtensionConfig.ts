import { IPermitConfig } from "../types/IPermitConfig";

export interface PermitExtensionConfig {
  permitConfig: IPermitConfig;
  enableAutomaticChecks?: boolean;
  enableResourceSync?: boolean;
  enableAttributeSync?: boolean;
  enableDataFiltering?: boolean;
  defaultTenant?: string;
  resourceTypeMapping?: Record<string, string>;
  excludedModels?: string[];
  excludedOperations?: string[];
}
