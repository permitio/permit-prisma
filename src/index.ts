import { createPermitClientExtension } from "./extension/PermitClientExtension";
import { PermitExtensionConfig } from "./models/PermitExtensionConfig";
import { IPermitConfig } from "./types/IPermitConfig";
import { PermitClient } from "./client/PermitClient";
import { PermitError } from "./utils/error";
import { AccessControlModel } from "./models/PermissionModels";

export {
  PermitExtensionConfig,
  IPermitConfig,
  PermitError,
  AccessControlModel,
};

export default createPermitClientExtension;
