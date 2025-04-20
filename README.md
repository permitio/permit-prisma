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
