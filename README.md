# Prisma Permit – Fine-Grained Authorization Extension for Prisma

Prisma Permit (`@permitio/prisma-permit`) is a Prisma Client extension that integrates Permit.io's fine-grained access control into your database queries. It enables role-based, attribute-based, and relationship-based access checks (RBAC, ABAC, ReBAC) directly through the Prisma Client, helping secure your application at the data layer. By using this extension, you ensure that every database operation is authorized according to central policies defined in Permit.io.

Prisma is a powerful ORM but **does not provide built-in fine-grained authorization controls**. As your application scales, you need stricter control over who can create, read, update, or delete specific data. This extension addresses that gap by enforcing permission checks and filtering data as part of Prisma queries.

## Installation

Install the package (alongside prisma client package) from npm:

```bash
npm install @permitio/prisma-permit @prisma/client
```

### Prerequisites

Make sure you have:

- A Permit.io account. Sign up [here](https://app.permit.io) if you do not have one.
- Permit's environment API key for your project (development/production). See [here](https://docs.permit.io/api/api-with-cli/)
- A Policy Decision Point (PDP)
  - You can use Permit's hosted cloud PDP
  - Or run a local PDP container (default is `http://localhost:7766`, recommended for ABAC/ReBAC). Read more on running a Local Policy Check using the PDP [here](https://docs.permit.io/overview/perform-a-local-policy-check/)
- Defined your resources, actions, and roles/policies in Permit.io's dashboard or API before using the extension

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
