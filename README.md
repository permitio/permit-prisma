# Prisma Permit – Fine-Grained Authorization Extension for Prisma

Prisma Permit (`@permitio/prisma-permit`) is a Prisma Client extension that integrates Permit.io's fine-grained access control into your database queries. It enables role-based, attribute-based, and relationship-based access checks (RBAC, ABAC, ReBAC) directly through the Prisma Client, helping secure your application at the data layer. By using this extension, you ensure that every database operation is authorized according to central policies defined in Permit.io.

Prisma is a powerful ORM but **does not provide built-in fine-grained authorization controls**. As your application scales, you need stricter control over who can create, read, update, or delete specific data. This extension addresses that gap by enforcing permission checks and filtering data as part of Prisma queries.

## Installation

Install the package (alongside prisma client package) from npm:

```bash
npm install @permitio/prisma-permit @prisma/client
```

## Prerequisites

Make sure you have:

- A Permit.io account. Sign up [here](https://app.permit.io) if you do not have one.
- Permit's environment API key for your project (development/production). See [here](https://docs.permit.io/api/api-with-cli/)
- A Policy Decision Point (PDP)
  - You can use Permit's hosted cloud PDP
  - Or run a local PDP container (default is `http://localhost:7766`, recommended for ABAC/ReBAC). Read more on running a Local Policy Check using the PDP [here](https://docs.permit.io/overview/perform-a-local-policy-check/)
- Defined your resources, actions, and roles/policies in Permit.io's dashboard or API before using the extension

# Usage and Setup

To use the extension, import it and extend your Prisma Client instance:

```ts
import { PrismaClient } from "@prisma/client";
import { PermitExtension } from "@permitio/prisma-permit";

const prisma = new PrismaClient().$extends(
  PermitExtension({
    token: "<YOUR_PERMIT_API_KEY>", // Permit.io API Key (required)
    pdp: "http://localhost:7766", // PDP address (optional)
    accessControlModel: "RBAC", // Access control model: 'RBAC' | 'ABAC' | 'ReBAC'
    autoSync: true, // Enable auto-sync of resource instances
    dataFiltering: false, // Enable automatic query filtering by permissions
  })
);
```

### In the above setup:

- `token` is your secret API key for Permit (required). This connects the extension to Permit’s policy engine.
- `pdp` is the URL of the Permit Policy Decision Point service. If you’re using Permit’s cloud or default local PDP, you can set this (defaults to `http://localhost:7766` or appropriate URL).
- `accessControlModel` specifies the permission model you use: Role-Based (RBAC), Attribute-Based (ABAC), or Relationship-Based (ReBAC). The extension will work with any model, but this flag can be used to adjust behavior or simply document intent.
- `autoSync` if `true`, the extension will automatically sync created/updated/deleted Prisma records to Permit.io as resource instances (including their attributes) for you. This ensures Permit’s data is up-to-date for permission checks (especially important for ABAC and ReBAC scenarios).
- `dataFiltering` if `true`, read queries (find, findMany) are automatically filtered so that only records the active user is permitted to access are returned. If `false`, you can still manually filter using provided methods.

---

### Additional Configuration Options

- `enableAutomaticChecks` (default: `false`): If set to `true`, enables automatic permission checks for each Prisma operation. If `false`, you’ll need to handle permission checks manually using the SDK.
- `defaultTenant` (default: `"default"`): The tenant key to associate with synced resources. Useful in multi-tenant applications.
- `resourceTypeMapping` (optional): A custom map from Prisma model names to Permit resource types. Useful if your model names don't match your Permit resource keys.
- `excludedModels` (optional): An array of model names to skip from permission checks or syncing.
- `excludedOperations` (optional): An array of Prisma operations to skip from checking (e.g., `['findFirst']`).
- `transactionAware` (currently unused): Reserved for future support to manage checks across multi-operation transactions.

You can mix and match these configurations to fine-tune how the extension behaves in your app.

## Configuration Options

Below is a full summary of the configuration options you can pass to `PermitExtension()`:

| Option                  | Required | Default             | Description                                                                                                                                              |
| ----------------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permitConfig`          | Yes      | _None_              | The Permit.io SDK config object. Must include `token`, `pdp`, and other core settings. See `IPermitConfig`.                                              |
| `accessControlModel`    | No       | `'rbac'`            | Defines the access control strategy. Can be `'rbac'`, `'abac'`, or `'rebac'`. Determines how permissions are enforced.                                   |
| `enableAutoSync`        | No       | `false`             | If `true`, resource instances (e.g., rows) are automatically synced with Permit.io on create/update/delete. Required for ReBAC and ABAC to stay in sync. |
| `enableDataFiltering`   | No       | `false`             | If `true`, adds row-level filtering on `findMany()` queries to return only records the user has access to (ReBAC only).                                  |
| `enableAutomaticChecks` | No       | `false`             | If `true`, automatically checks permissions on all Prisma queries and mutations, rejecting unauthorized actions.                                         |
| `defaultTenant`         | No       | `'default'`         | The default tenant ID to use when syncing resource instances to Permit.                                                                                  |
| `resourceTypeMapping`   | No       | `{}` (empty object) | A map of Prisma model names to Permit resource types. Useful when your model names differ from Permit’s resource types.                                  |
| `debug`                 | No       | `false`             | If `true`, enables verbose logs for debugging Permit extension behavior.                                                                                 |
| `excludedModels`        | No       | `[]`                | List of model names to skip from automatic permission checks.                                                                                            |
| `excludedOperations`    | No       | `[]`                | List of operations to skip from automatic permission checks (e.g., `['createMany']`).                                                                    |
| `transactionAware`      | No       | `false`             | Reserved for future use. Enables experimental support for permission checks inside Prisma transactions.                                                  |

### Notes

- At a minimum, `permitConfig.token` and `permitConfig.pdp` are required to use the extension.
- Set `accessControlModel` to `'rebac'` if you're using relationship-based permissions and want instance filtering + syncing.
- You can mix and match `enableAutoSync` and `enableDataFiltering` based on your needs.
- `enableAutomaticChecks` is required if you want the extension to enforce access control across all queries and mutations.
- All config options are optional except `permitConfig`.

## Access Control Models

### Role-Based Access Control (RBAC)

A model where access is granted based on user roles (`permit.io`). You define roles (e.g., _Admin_, _Editor_, _Viewer_) and assign them to users. Each role has permissions to perform certain actions on certain resource types. For example, an "Editor" role might allow `edit` on `Document` resources. In RBAC, permissions are typically global for a resource type (all documents) based on the user's role.

---

### Attribute-Based Access Control (ABAC)

A model that grants or denies access based on attributes of the user, resource, or environment (`permit.io`). Policies consist of rules like:

- Users can view documents if `user.department == document.department`
- Only allow updates if `document.status == DRAFT`

ABAC allows very fine-grained rules using any metadata. To use ABAC with Permit, you define attributes for your users and resources in Permit.io, and create policy rules evaluating those attributes.

> The Prisma Permit extension will sync resource attributes (if `autoSync` is on) so that Permit’s PDP can evaluate those rules at check time.

---

### Relationship-Based Access Control (ReBAC)

A model focusing on relationships between users and resources (`permit.io`). A common example is role assignments on specific resource instances — e.g., a user might be an "Owner" or "Collaborator" on a particular project (but not others).

ReBAC policies take into account these relationships or group memberships. Permit.io supports ReBAC by allowing roles to be scoped to resource instances (and by supporting graph-based permissions).

With Prisma Permit, if you use ReBAC, you will likely attach users to resources (instances) in Permit (for example, assign a user the role "Owner" on a project with key `project123`). The `permit.check()` calls will then include resource instances (like `"project:project123"`) to verify instance-level permissions.

---

### Choose the model that fits your application’s needs:

- **Use RBAC** for straightforward role-based rules applied globally.
- **Use ABAC** for context-aware rules based on attributes (often combined with roles).
- **Use ReBAC** for per-resource-instance permissions and complex structures or sharing models.
