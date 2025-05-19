import { createPermitClientExtension } from "./extension/PermitClientExtension";
import { PermitExtensionConfig } from "./models/PermitExtensionConfig";
import { IPermitConfig } from "./types/IPermitConfig";
import { PermitError } from "./utils/error";

export { PermitExtensionConfig, IPermitConfig, PermitError };

export default createPermitClientExtension;
