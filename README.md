# @permitio/permit-prisma – Fine-Grained Authorization Extension for Prisma

Prisma Permit (`@permitio/permit-prisma`) is a Prisma Client extension that integrates Permit.io's fine-grained access control into your database queries. It enables role-based, attribute-based, and relationship-based access checks (RBAC, ABAC, ReBAC) directly through the Prisma Client, securing your application at the data layer. By using this extension, you ensure that every database operation is authorized according to central policies defined in Permit.io.

The extension implements three key capabilities:
- **Direct permission checks**: Check if users are authorized to perform specific actions on resources before executing database operations
- **Permission filtering**: Automatically restrict database queries so users only see data they're authorized to access
- **Resource synchronization**: Keep your Permit.io policy engine in sync with your database by automatically ingesting resource instances and their relationships

Prisma is a powerful ORM but **does not provide built-in fine-grained authorization controls**. As your application scales, you need stricter control over who can create, read, update, or delete specific data. This extension addresses that gap by enforcing permission checks and filtering data as part of Prisma queries, while maintaining a clean separation between your data access and authorization logic.

## Installation

Install the package (alongside the prisma client package) from npm:

```bash
npm install @permitio/permit-prisma @prisma/client
```

## Prerequisites

Make sure you have:

- A Permit.io account. Sign up [here](https://app.permit.io) if you do not have one.
- Permit's environment API key for your project (development/production). Find this in the Permit.io dashboard under Environment Settings > API Keys.
- A Policy Decision Point (PDP)
  - You can use Permit's hosted cloud PDP - `https://cloudpdp.api.permit.io`
  - Or run a local PDP container (default is `http://localhost:7766`, recommended for ABAC/ReBAC). Read more on running a Local Policy Check using the PDP [here](https://docs.permit.io/overview/perform-a-local-policy-check/)
- Define your resources, actions, roles and policies in Permit.io's dashboard or via the API before using the extension. At minimum, you'll need to:
  - Create resources matching your Prisma models
  - Define actions (e.g., create, read, update, delete)
  - Create roles and assign permissions

# Usage and Setup

To use the extension, import it and extend your Prisma Client instance:

```ts
import { PrismaClient } from "@prisma/client";
import { createPermitClientExtension } from "@permitio/permit-prisma";

const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig: {
      token: "<YOUR_PERMIT_API_KEY>", // Permit.io API Key (required)
      pdp: "http://localhost:7766", // PDP address (required)
    }
    accessControlModel: "RBAC", // Access control model: 'RBAC' | 'ABAC' | 'ReBAC'
    enableAutoSync: true, // Enable auto-sync of resource instances
    enableDataFiltering: false, // Enable automatic query filtering by permissions
    enableAutomaticChecks: true, // Enable automatic checks
  })
);
```

### In the above setup:

- `permitConfig` is the object containing all Permit.io SDK configuration parameters:
  - `permitConfig.token` is your secret API key for Permit (required). This connects the extension to Permit's policy engine.
  - `permitConfig.pdp` is the URL of the Permit Policy Decision Point service. For local development, it defaults to `http://localhost:7766`. For production with Permit's cloud PDP, this will be automatically configured when using your API token.
  - `permitConfig.debug` (optional): Set to `true` to enable detailed logging from the Permit SDK.
- `enableAutomaticChecks` (default: `false`): **Critical setting** that enables permission enforcement. If set to `true`, the extension will automatically check permissions for all Prisma operations and block unauthorized actions. If `false`, you'll need to handle permission checks manually using methods like `prisma.$permit.check()` or `prisma.$permit.enforceCheck()`. This must be enabled for `enableAutoSync` and `enableDataFiltering` to work.
- `accessControlModel` (required for optimal behavior): Specifies which permission model you're using: Role-Based (`"rbac"`), Attribute-Based (`"abac"`), or Relationship-Based (`"rebac"`). This setting is crucial as it determines:
  - How permission checks are formatted
  - What data is included in permission requests
  - How resource instances are synchronized with Permit.io
  
  While the extension will default to basic RBAC behavior if not specified, you should **always set this explicitly** to match your Permit.io policy configuration for correct operation.
  
  Examples:
  - Set to `"rbac"` if using simple role-based permissions
  - Set to `"abac"` if using attribute-based conditions in your policies
  - Set to `"rebac"` if using relationship-based or instance-level permissions
- `enableAutoSync` if `true`, the extension will perform data ingestion by automatically syncing created/updated/deleted Prisma records to Permit.io as resource instances (including their attributes). This ensures Permit's data is up-to-date for permission checks. This is especially important for ReBAC scenarios where relationships between resources are used for permission decisions. Requires `enableAutomaticChecks: true`.

- `enableDataFiltering` if `true`, enables pre-fetch filtering where read queries (find, findMany) are automatically modified to include only records the active user is permitted to access. The extension adds an `id IN (...)` clause to your queries before they reach the database. If `false`, you can still manually filter using the provided `filterQueryResults` method. Requires `enableAutomaticChecks: true`.

**Recommended configurations:**
- For RBAC: `{ accessControlModel: "rbac", enableAutomaticChecks: true }`
- For ABAC: `{ accessControlModel: "abac", enableAutomaticChecks: true, enableAutoSync: true }`  
- For ReBAC: `{ accessControlModel: "rebac", enableAutomaticChecks: true, enableAutoSync: true, enableDataFiltering: true }`
---


### Additional Configuration Options

- `defaultTenant` (default: `"default"`): The tenant key to associate with synced resources. Useful in multi-tenant applications where resources need to be isolated by tenant.

- `resourceTypeMapping` (optional): A custom map from Prisma model names to Permit resource types. Useful if your model names don't match your Permit resource keys.
  Example: `{ User: "customer", BlogPost: "article" }`

- `excludedModels` (optional): An array of model names to skip from permission checks or syncing.
  Example: `["Log", "Audit", "SystemConfig"]`

- `excludedOperations` (optional): An array of Prisma operations to skip from checking.
  Example: `["findFirst", "count", "aggregate"]`

These options can be combined with the core settings to customize the extension's behavior for your specific application needs.

## Configuration Options

Below is a full summary of the configuration options you can pass to `createPermitClientExtension()`:

| Option                  | Required | Default             | Description                                                                                                                                              |
| ----------------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `permitConfig`          | Yes      | _None_              | The Permit.io SDK config object. Must include `token`, `pdp`, and other core settings. See `IPermitConfig`.                                              |
| `accessControlModel`    | No       | `'rbac'`            | Defines the access control strategy. Can be `'rbac'`, `'abac'`, or `'rebac'`. Determines how permissions are enforced.                                   |
| `enableAutoSync`        | No       | `false`             | If `true`, resource instances (e.g., rows) are automatically synced with Permit.io on create/update/delete. Required for ReBAC and useful for ABAC.      |
| `enableDataFiltering`   | No       | `false`             | If `true`, adds row-level filtering on `findMany()` queries to return only records the user has access to. Most useful with ReBAC.                       |
| `enableAutomaticChecks` | No       | `false`             | If `true`, automatically checks permissions on all Prisma queries and mutations, rejecting unauthorized actions.                                         |
| `defaultTenant`         | No       | `'default'`         | The default tenant ID to use when syncing resource instances to Permit.                                                                                  |
| `resourceTypeMapping`   | No       | `{}` (empty object) | A map of Prisma model names to Permit resource types. Useful when your model names differ from Permit's resource types.                                  |
| `excludedModels`        | No       | `[]`                | List of model names to skip from automatic permission checks.                                                                                            |
| `excludedOperations`    | No       | `[]`                | List of operations to skip from automatic permission checks (e.g., `['createMany']`).                                                                    |

### Notes

- At a minimum, `permitConfig.token` and `permitConfig.pdp` are required to use the extension.
- `enableAutomaticChecks` must be set to `true` for `enableAutoSync` and `enableDataFiltering` to work.
- To use the extension, a minimum of `permitConfig.token` and `permitConfig.pdp` is required.
- Set `accessControlModel` to `'rebac'` if you're using relationship-based permissions and want instance filtering + syncing.
- For ABAC, enable `enableAutoSync` to ensure resource attributes are kept in sync with Permit.io.
- All config options are optional except `permitConfig`.

**Example configurations for different scenarios:**

```ts
// Basic RBAC setup
createPermitClientExtension({
  permitConfig: { token: "YOUR_API_KEY", pdp: "http://localhost:7766" },
  accessControlModel: "rbac",
  enableAutomaticChecks: true
})

// ABAC setup with attribute syncing
createPermitClientExtension({
  permitConfig: { token: "YOUR_API_KEY", pdp: "http://localhost:7766" },
  accessControlModel: "abac",
  enableAutomaticChecks: true,
  enableAutoSync: true
})

// ReBAC setup with full features
createPermitClientExtension({
  permitConfig: { token: "YOUR_API_KEY", pdp: "http://localhost:7766" },
  accessControlModel: "rebac",
  enableAutomaticChecks: true,
  enableAutoSync: true,
  enableDataFiltering: true
})
```

## Access Control Models

This extension supports three access control models from Permit.io:

### Role-Based Access Control (RBAC)

**What it is**: Users are assigned roles (Admin, Editor, Viewer) with predefined permissions to perform actions on resource types.

**Example**: An "Editor" role can update any document in the system.

**Best for**: Simple permission structures where access is determined by job function or user level.

### Attribute-Based Access Control (ABAC)

**What it is**: Access decisions based on attributes of users, resources, or environment.

**Examples**:
- Allow access if `user.department == document.department`
- Allow updates if `document.status == "DRAFT"`

**How it works with the extension**: When `enableAutoSync` is on, resource attributes are automatically synced to Permit.io for policy evaluation.

**Best for**: Dynamic rules that depend on context or data properties.

### Relationship-Based Access Control (ReBAC)

**What it is**: Permissions based on relationships between users and specific resource instances.

**Example**: A user is an "Owner" of document-123 but just a "Viewer" of document-456.

**How it works with the extension**:
- Resource instances are synced to Permit.io (with `enableAutoSync: true`)
- Permission checks include the specific resource instance ID

**Best for**: Collaborative applications where users need different permissions on different instances of the same resource type.

### Choosing the Right Model

- **RBAC**: When you need simple, role-based access control
- **ABAC**: When decisions depend on data properties or contextual information
- **ReBAC**: When users need different permissions on different instances

## Using the Prisma Permit Extension

### Setting the Active User

Before performing any operations with the extension, you need to identify which user is making the request. This is a critical step as all permission checks and data filtering will be based on this user context.

In a typical web application, you'd set the user context at the beginning of a request handler after authenticating the user:

```ts
// Express.js example
app.get('/documents', async (req, res) => {
  // Set the user context from your authentication system
  prisma.$permit.setUser(req.user.id);
  
  // All subsequent Prisma operations will respect this user's permissions
  const documents = await prisma.document.findMany();
  
  // documents will only contain what this user is allowed to access
  res.json(documents);
});
```
You can set the user in different ways depending on your access control model:

```ts
// Simple user identifier (for RBAC)
prisma.$permit.setUser("user@example.com");

// User with attributes (for ABAC)
prisma.$permit.setUser({
  key: "user@example.com",
  attributes: { department: "engineering", clearance: "high" }
});

// For ReBAC, you typically just need the user ID
// The relationships are established via resource instances in Permit
prisma.$permit.setUser("user@example.com");
// Then when you create/update resources, include relationship fields:
await prisma.document.create({
  data: {
    title: "Document Title",
    content: "Content",
    ownerId: "user@example.com" // This establishes the relationship
  }
});
```

**Important Notes:**
- The user identifier should match what's configured in your Permit.io system
- For ReBAC, relationships between users and resources are established through your data model (e.g., ownerId field) and synced to Permit
- Setting the user is thread-safe - it only affects the current Prisma client instance
- You should call `setUser` once per request to ensure proper permission enforcement
- The user context applies to all subsequent operations until you set a different user

### RBAC Example: Document Access Control

In this example, we implement role-based access to documents with different permission levels:
- Admin: full access (create, read, update, delete)
- Customer: read-only access

#### 1. Setup RBAC in Permit.io

First, configure your resources, roles, and permissions in Permit.io:
- Create a `document` resource with `create`, `read`, `update`, `delete` actions
- Define an `admin` role with all permissions
- Define a `customer` role with only `read` permission

Next, create the users and assign roles:

- Navigate to User Management
- Click "Add user"
- Create user with Key: "admin@example.com"
- Assign "admin" role in Top Level Access
- Create another user with Key: "customer@example.com"
- Assign "customer" role in Top Level Access

#### 2. Implement with Prisma Permit

```ts
import { PrismaClient } from "@prisma/client";
import { createPermitClientExtension, AccessControlModel } from "@permitio/prisma-permit";

// Configure the extension with RBAC
const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig: {
      token: process.env.PERMIT_API_KEY!,
      pdp: "http://localhost:7766"
    },
    accessControlModel: AccessControlModel.RBAC,
    enableAutomaticChecks: true  // Automatically enforce permissions
  })
);

// Admin user operations
async function adminOperations() {
  // Set user context for the admin
  prisma.$permit.setUser("admin@example.com");
  
  // Admin can create documents (allowed)
  const doc = await prisma.document.create({
    data: {
      title: "New Document",
      content: "Document content",
      ownerId: "admin@example.com"
    }
  });
  
  // Admin can read documents (allowed)
  const docs = await prisma.document.findMany();
  
  // Admin can update documents (allowed)
  await prisma.document.update({
    where: { id: doc.id },
    data: { title: "Updated Title" }
  });
  
  // Admin can delete documents (allowed)
  await prisma.document.delete({ where: { id: doc.id } });
}

// Customer user operations
async function customerOperations() {
  // Set user context for the customer
  prisma.$permit.setUser("customer@example.com");
  
  // Customer can read documents (allowed)
  const docs = await prisma.document.findMany();
  
  try {
    // Customer cannot create documents (denied)
    await prisma.document.create({
      data: { 
        title: "Unauthorized Creation", 
        content: "This will fail",
        ownerId: "customer@example.com"
      }
    });
  } catch (error) {
    // Permission denied error
  }
  
  // All other operations will similarly be denied
}
```
#### How It Works
The extension automatically:

Intercepts all Prisma operations
Checks if the current user has permission for the operation
Allows or denies the operation based on the user's role

For complete implementation, see `examples/rbac/document.ts`.

### ABAC Example: Medical Records Access Control

In this example, we implement attribute-based access to medical records where permissions are determined by matching the user's department with the record's department:

- Cardiologists can only access cardiology records
- Oncologists can only access oncology records

#### 1. Setup ABAC in Permit.io

First, configure resources and attributes in Permit.io:

- Create a `medical_record` resource with a `department` attribute
- Create users with a `department` attribute
- Create condition sets for user departments and resource departments
- Set policies to allow access only when departments match

#### 2. Implement with Prisma Permit

```ts
import { PrismaClient } from "@prisma/client";
import { createPermitClientExtension, AccessControlModel } from "@permitio/prisma-permit";

// Configure the extension with ABAC
const prisma = new PrismaClient().$extends(
  createPermitClientExtension({
    permitConfig: {
      token: process.env.PERMIT_API_KEY!,
      pdp: "http://localhost:7766"
    },
    accessControlModel: AccessControlModel.ABAC, 
    enableAutomaticChecks: true,
  })
);

// Example: Cardiologist operations
async function cardiologistOperations() {
  // Set user with department attribute
  prisma.$permit.setUser({
    key: "doctor_cardio@example.com",
    attributes: { 
      department: "cardiology" 
    }
  });
  
  // Can access cardiology records (ALLOWED)
  const cardioRecords = await prisma.medicalRecord.findMany({
    where: { department: "cardiology" }
  });
  
  // Can update cardiology records (ALLOWED)
  if (cardioRecords.length > 0) {
    await prisma.medicalRecord.update({
      where: { id: cardioRecords[0].id },
      data: { 
        content: "Updated by cardiologist",
        department: "cardiology"  // Must include department
      }
    });
  }
  
  // Cannot access oncology records (DENIED)
  try {
    await prisma.medicalRecord.findMany({
      where: { department: "oncology" }
    });
  } catch (error) {
    // Permission denied
  }
}

// Example: Oncologist operations
async function oncologistOperations() {
  // Set user with department attribute
  prisma.$permit.setUser({
    key: "doctor_onco@example.com",
    attributes: { 
      department: "oncology" 
    }
  });
  
  // Can access oncology records (ALLOWED)
  const oncoRecords = await prisma.medicalRecord.findMany({
    where: { department: "oncology" }
  });
  
  // Cannot access cardiology records (DENIED)
  try {
    await prisma.medicalRecord.findMany({
      where: { department: "cardiology" }
    });
  } catch (error) {
    // Permission denied
  }
}
```
#### 3. Key Points for ABAC

- User context must include attributes (use `setUser` with an `attributes` object).
- Resources must have corresponding attributes for policy evaluation.
- When updating records, include all attributes used in permission decisions.
- For a complete implementation, refer to `examples/abac/medical-records.ts`.
