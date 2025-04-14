import { createPermitClientExtension } from "./extension/PermitClientExtension";
import { PermitExtensionConfig } from "./models/PermitExtensionConfig";
import { IPermitConfig } from "./types/IPermitConfig";
import { PermitClient } from "./client/PermitClient";
import { PermitError } from "./utils/error";

// Export public types
export { PermitExtensionConfig, IPermitConfig, PermitError };

// Export the extension factory
export default createPermitClientExtension;
