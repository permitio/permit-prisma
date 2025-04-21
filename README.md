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
    enableAutoSync: true, // Enable auto-sync of resource instances
    enableDataFiltering: false, // Enable automatic query filtering by permissions
    enableAutomaticChecks: true,
  })
);
```

### In the above setup:

- `token` is your secret API key for Permit (required). This connects the extension to Permit’s policy engine.
- `pdp` is the URL of the Permit Policy Decision Point service. If you’re using Permit’s cloud or default local PDP, you can set this (defaults to `http://localhost:7766` or appropriate URL).
- `accessControlModel` specifies the permission model you use: Role-Based (RBAC), Attribute-Based (ABAC), or Relationship-Based (ReBAC). The extension will work with any model, but this flag can be used to adjust behavior or simply document intent.
- `enableAutoSync` if `true`, the extension will automatically sync created/updated/deleted Prisma records to Permit.io as resource instances (including their attributes) for you. This ensures Permit’s data is up-to-date for permission checks (especially important for ABAC and ReBAC scenarios).
- `enableDataFiltering` if `true`, read queries (find, findMany) are automatically filtered so that only records the active user is permitted to access are returned. If `false`, you can still manually filter using provided methods.

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

> The Prisma Permit extension will sync resource attributes (if `enableAutoSync` is on) so that Permit’s PDP can evaluate those rules at check time.

---

### Relationship-Based Access Control (ReBAC)

A model focusing on relationships between users and resources (`permit.io`). A common example is role assignments on specific resource instances — e.g., a user might be an "Owner" or "Collaborator" on a particular project (but not others).

ReBAC policies take into account these relationships or group memberships. Permit.io supports ReBAC by allowing roles to be scoped to resource instances (and by supporting graph-based permissions).

With Prisma Permit, if you use ReBAC, you will likely attach users to resources (instances) in Permit (for example, assign a user the role "Owner" on a project with key `project123`). The `permit.check()` calls will then include resource instances (like `"project:project123"`) to verify instance-level permissions.

### Choose the model that fits your application’s needs:

- **Use RBAC** for straightforward role-based rules applied globally.
- **Use ABAC** for context-aware rules based on attributes (often combined with roles).
- **Use ReBAC** for per-resource-instance permissions and complex structures or sharing models.

## Using the Prisma Permit Extension

Once configured, the extension adds **methods** to your Prisma client to perform permission checks and management. It also can intercept queries if you enabled auto-sync or filtering. Below are the key usage patterns:

---

### Setting the Active User

Before performing any authorized operations, you should identify which user is making the request. The extension provides `prisma.setUser(user)` to set the "current user" context on the Prisma client:

```ts
prisma.setUser(userId);
```

- `userId` is a unique identifier (string) for the user (must match the user key in Permit.io's system). You can call this at the start of a request (e.g., after verifying the user’s identity via auth). The user context will be used by the extension for subsequent checks and filtering.

Alternatively, if you prefer not to use a global context, you can directly supply a user identifier in each check call (see below). But using `setUser` once per request simplifies the API calls.

> **Note:** Ensure that this user exists in your Permit.io **User Directory** (you can create users via the Permit.io UI or API). The extension doesn’t automatically sync users; it assumes the user identities are already known to Permit. If a user isn’t found in Permit, all checks for that user will be **denied by default**.

---

### Checking Permissions (`check`)

Use `prisma.check(action, resource, resourceInstance?)` to **check if the current user is allowed** to perform an action. It returns a boolean:

```ts
const canEdit = await prisma.check("edit", "Document", documentId);
if (!canEdit) {
  // deny access (e.g., throw error or return 403)
}
```

#### Parameters:

- **action**: the action (permission) you want to check (e.g., `"create"`, `"read"`, `"update"`, `"delete"`, or any custom action string defined in your Permit policies).

- **resource**: the resource type or identifier. You can pass a resource type name (string) or a specific resource instance. For a resource instance, you have two options:

  - **Concatenated string**: `"resourceType:instanceKey"`, e.g., `"Document:doc_123"`.
  - **Separate arguments**: pass the resource type as first argument and the instance ID/key as second (as shown above). If a third argument is provided (instance ID), the extension will form the compound resource reference for the check.

- **resourceInstance** (optional): the unique identifier of the resource instance (if checking a specific instance). This is not needed for global (type-level) checks.

#### Usage examples:

- **RBAC/global check**:

  ```ts
  prisma.check("create", "Document");
  // checks if user can create a Document (any document, type-level permission)
  ```

- **Instance check (ReBAC or contextual)**:

  ```ts
  prisma.check("view", "Document", documentId);
  // checks if user can view the specific document with id documentId
  ```

- **Attribute-based check (ABAC)**: This can be similar to RBAC usage in code:

  ```ts
  prisma.check("transfer", "Account", accountId);
  ```

  But behind the scenes Permit will evaluate attributes (e.g., allow if account status is open and user’s clearance is high).

> Under the hood, this uses Permit’s core `permit.check()` function to evaluate the policy. It will consult Permit’s PDP (Policy Decision Point) with the given user, action, and resource to return an allow/deny decision.

## Enforcing Permissions (`enforceCheck`)

Often, you want to not just get a boolean, but immediately enforce the result by preventing the operation when not allowed. The `prisma.enforceCheck(action, resource, resourceInstance?)` method wraps check and throws an error if the permission check fails. This helps you fail fast:

```ts
await prisma.enforceCheck("delete", "Document", documentId);
// If the above returns (no error), the user is allowed to delete this document.
// Proceed to perform the deletion:
await prisma.document.delete({ where: { id: documentId } });
```

If the user is not **permitted**, `enforceCheck` will throw (for example, an `UnauthorizedError` or a generic Error with a message indicating lack of permission). You can catch this error to return an HTTP 403 response or handle it appropriately. If the user **is permitted**, `enforceCheck` simply returns `true` (or resolves without error), allowing your code to continue.

Using `enforceCheck` ensures you never accidentally execute a Prisma operation without a prior check. It’s recommended for write operations like creating or deleting sensitive records. For read operations, you might prefer filtering results (next section) over throwing an error.

---

## Filtering Query Results by Permissions

If `enableDataFiltering` is enabled in the extension configuration, **you don’t have to do anything special** to filter read queries – the extension will automatically apply a filter to your queries. For example:

```ts
prisma.setUser(currentUserId);
// Without specifying any extra filter, this will only return documents that the currentUserId is allowed to "read":
const docs = await prisma.document.findMany();
```

When you call `findMany()` (or `findUnique`, etc.), the extension intercepts the query. It will query Permit to get the list of resource instances the user can access for that model and action (by default, the “read” action for find queries), and then inject an `id IN (...)` filter into the Prisma query before it hits the database. The result is that `docs` contains only the documents the user has permission to read **by policy**. The developer doesn’t need to manually filter by user ID or any attribute – permissions are centrally enforced.

If you did not enable automatic filtering, you can still achieve the same result manually using the extension’s helper function `getAllowedResourceIds`:

```ts
const allowedIds = await prisma.getAllowedResourceIds("read", "Document");
// allowedIds is an array of document IDs the user can read
const docs = await prisma.document.findMany({
  where: { id: { in: allowedIds } },
});
```

This two-step approach (first get allowed IDs, then query) is essentially what the extension does internally when `enableDataFiltering` is `true`. You might use it if you want more control or to debug what's happening. It’s also useful if you need to combine the permission filter with other custom filters.

**Performance note**: Permit’s PDP is designed to handle large scale permission checks quickly, but adding an extra check per query could introduce some latency. The automatic filtering tries to batch decisions (fetching many allowed IDs in one go) to minimize overhead. If a user has very large numbers of accessible resources, consider the implications on query performance (e.g., the `id IN (...)` clause). Typically, roles and permissions are structured to narrow down data to a manageable subset per user.

---

## Creating and Syncing Resource Instances (Auto-Sync)

If `enableAutoSync: true` is set, the extension will automatically synchronize Prisma model instances with Permit.io’s **Resource Instances**. This is crucial for ABAC and ReBAC:

### On Create:

When you create a new record via Prisma (e.g., `prisma.document.create({...})`), the extension will, after the DB insert succeeds, call Permit’s API to create a corresponding resource instance in Permit’s database. It will use the configured resource type (by default, it uses your Prisma model name or a mapping if you provided one) and the new record’s ID as the resource key. It will also include relevant attributes of that record. For example, after creating a new `Asset` record, it calls Permit to create an `asset` instance with that ID and properties. This means your Permit policies (especially ABAC rules that rely on resource fields like `category` or `owner`) have up-to-date data to evaluate.

### On Update:

If you update a record’s attributes (especially those used in ABAC policies), the extension can update the resource instance in Permit. (Ensure the fields you want to sync are included in the configuration or by default all fields are sent.) For example, if a document’s `classification` changes and you have a policy depending on that, the extension will update that instance’s attribute in Permit.

### On Delete:

When a protected record is deleted in Prisma, the extension will inform Permit to delete or archive the corresponding resource instance, to keep the system clean. (Alternatively, Permit might mark it as inactive if needed for audit trails – refer to Permit.io docs for how deletions are handled via API.)

Auto-sync simplifies **data onboarding** into Permit.io. You can also choose to pre-create resources in Permit (via UI or migration scripts), but with auto-sync the system is kept in sync automatically with minimal effort.

> **Note:** Auto-sync assumes you have defined the Resource Type in Permit’s system ahead of time (with matching name and actions). For example, if your Prisma model is `Resource` and you want to sync as `asset` resource type in Permit, ensure you have created a resource type "asset" in Permit.io with the relevant actions (read, create, etc.). You can configure a custom mapping if the names differ (e.g., `{ model: 'Resource', resourceType: 'asset' }`). By default, the extension will try to use the model name in lowercase as the resource type key.

---

## Putting It All Together (Example)

Suppose we have a Prisma model `Project { id, name, ownerId, sensitive, ... }`. We want:

- Only project owners (or admins) to update or delete a project.
- Only team members (relationship) or users with a certain clearance (attribute) to view sensitive projects.

With Permit.io, you could define:

- Resource type: “project” with actions “create/read/update/delete”.
- RBAC roles: “admin” (full access to all projects), “member” (read access if member).
- ABAC policy: allow read if `project.sensitive` is false or if `user.clearance` is high.
- ReBAC: assign users as “members” of specific project instances (a relationship indicating membership).

After setting up those policies, using Prisma Permit extension:

```ts
prisma.setUser(currentUserId);

// Enforce permission before updating a project
await prisma.enforceCheck("update", "project", projectId);

// If no error, safe to proceed
await prisma.project.update({
  where: { id: projectId },
  data: { name: newName },
});

// Get all projects current user can view
const projects = await prisma.project.findMany();
```

In the create/update/delete operations, `enforceCheck` ensures that if the user isn’t allowed to perform that action, an error is thrown and the DB operation won’t execute. For the findMany, since we enabled `enableDataFiltering`, the result will automatically include only permitted projects (e.g., all public projects plus the sensitive ones the user has clearance for, plus any projects they are a member of, according to your example policies).

## Additional Notes

- **Default Deny**: If no permit policy explicitly allows a given action for a user, `check()` returns false (and `enforceCheck` throws). This follows the security best practice of default deny (least privilege).

- **Error Handling**: You can customize how errors are handled. By default, `enforceCheck` uses a generic error. You might catch it and convert to an HTTP response or a custom error type. The Permit SDK can be configured with `throwOnError` (to throw on network issues) vs returning false. By default, network timeouts yield a false (denied) rather than throwing, to fail safe.

- **Logging**: Permit SDK can log debug info if needed (set `log: { level: "debug" }` in the Permit config passed to `PermitExtension` if exposed, or in an environment variable). This can help troubleshoot why something was denied.

- **Multi-Tenancy**: Permit.io supports multi-tenant scenarios. If your application is multi-tenant (isolating permissions per tenant/org), you can specify the tenant context in your Permit checks. The extension might offer a config like `defaultTenant` or you can pass tenant as part of user or resource IDs (Permit’s API allows specifying a tenant parameter). Ensure your `permit.check` calls include tenant info if applicable (e.g., user `alice@company.com` in tenant `company.com`). By default, everything is under the “default” tenant if not specified.

- **Supported Prisma Operations**: This extension works with Prisma Client queries. It uses Prisma’s `$extends` API under the hood to wrap query execution. It should support `.findUnique`, `.findMany`, `.create`, `.update`, `.delete`, and any other relevant methods. For aggregated queries or raw SQL, you will need to manually enforce permissions (the extension cannot intercept raw queries).

- **Resources and Actions Setup**: Remember to configure your resources and actions in Permit.io to match your usage. The extension does not create resource types or define what “read”/“update” means – that’s up to your Permit.io configuration. For instance, if you use `prisma.check('publish', 'Post')`, ensure “publish” is an action on the “post” resource in your Permit setup, otherwise the check will always return false.

- **References**: For more on Permit.io’s Node.js SDK and its capabilities (which this extension leverages), see the [Permit.io Node.js SDK docs](https://github.com/permitio/permit-node) and the [`permit.check()` API reference](https://docs.permit.io). Understanding how Permit handles policy decisions will help you design your authorization logic effectively.
