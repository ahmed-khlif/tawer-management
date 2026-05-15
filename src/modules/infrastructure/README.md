# Infrastructure Module

Manages the company's technical infrastructure — physical or cloud **Servers** and the **Services** (applications) running on them. Provides full CRUD with permission-gated UI, paginated/filterable tables, and consistent JWT-authenticated API communication.

---

## Domain Entities

### Server

Represents a physical or cloud machine.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `domain` | `string` | Associated domain |
| `description` | `string` | Rich-text description |
| `ip` | `string` | IP address |
| `cpus` | `string` | CPU core count / spec |
| `ram` | `string` | RAM size (e.g. `16GB`) |
| `storage` | `string` | Storage size (e.g. `500GB`) |
| `bandwidth` | `string` | Bandwidth limit |
| `backupCloudProvider` | `boolean` | Whether backups are handled by the cloud provider |
| `paid` | `boolean` | Payment status |
| `paidAt` | `string?` | Payment date (frontend-formatted) |
| `expiredAt` | `string?` | Expiration date (frontend-formatted) |
| `status` | `Running \| Stopped \| Maintenance` | Current operational status |
| `managers` | `ManagerType[]` | Users assigned to manage this server |
| `createdAt` | `string` | Creation timestamp |
| `updatedAt` | `string` | Last update timestamp |

### Service

Represents an application or service deployed on a server.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `domain` | `string?` | Service-specific domain |
| `description` | `string?` | Optional description |
| `server` | `{ id, name, ip, domain }` | Parent server reference |
| `sslCertificate` | `boolean` | Whether SSL is enabled |
| `sslCertificateByCloudProvider` | `boolean` | Whether SSL is managed by cloud provider |
| `hasBackup` | `boolean` | Whether backup is enabled |
| `backupDestination` | `string?` | Backup destination path/location |
| `paid` | `boolean` | Payment status |
| `paidAt` | `string?` | Payment date (frontend-formatted) |
| `expiredAt` | `string?` | Expiration date (frontend-formatted) |
| `status` | `Running \| Stopped \| Maintenance` | Current operational status |
| `createdAt` | `string` | Creation timestamp |
| `updatedAt` | `string` | Last update timestamp |

---

## Directory Structure

```
src/modules/infrastructure/
├── types/
│   ├── servers.ts          # ServerType, ServerInResponseType, UploadedServerType, ManagerType
│   └── services.ts         # ServiceType, ServiceInResponseType, UploadedServiceType
│
├── validations/
│   ├── servers.schema.ts   # Zod schema for server form (i18n-driven error messages)
│   └── services.schema.ts  # Zod schema for service form (i18n-driven error messages)
│
├── dto/
│   ├── requests/
│   │   ├── servers.ts      # cleanServerDataToUpload  — form data → UploadedServerType
│   │   └── services.ts     # cleanServiceDataToUpload — form data → UploadedServiceType
│   └── responses/
│       ├── servers.ts      # castToServerType  — API response → ServerType (dates formatted)
│       └── services.ts     # castToServiceType — API response → ServiceType (dates formatted)
│
├── services/
│   ├── extractions/
│   │   ├── servers.ts      # retrieveServersFromServerSide  — GET /servers
│   │   └── services.ts     # retrieveServicesFromServerSide — GET /servers/services
│   └── uploads/
│       ├── server.ts       # uploadServerOnServerSide  — POST/PATCH /servers
│       └── service.ts      # uploadServiceOnServerSide — POST/PATCH /servers/services
│
├── hooks/
│   ├── extractions/
│   │   ├── servers.ts      # useServers  — React Query, pagination, search, status filter
│   │   └── services.ts     # useServices — React Query, pagination, search, status + server filter
│   └── uploads/
│       ├── server.ts       # useServerUpload  — react-hook-form + zod + toast notifications
│       └── service.ts      # useServiceUpload — react-hook-form + zod + toast notifications
│
└── components/
    ├── servers/
    │   ├── servers-list.tsx          # Tanstack table with search, status filter, bulk delete
    │   ├── server-details.tsx        # Server detail view (sections: network, hardware, billing)
    │   ├── server-details-modal.tsx  # Modal wrapper for server-details
    │   └── upload/
    │       ├── index.tsx             # UploadServerDialog — Dialog wrapper (create & edit)
    │       └── form.tsx              # ServerUploadForm — full form with managers multi-select
    └── services/
        ├── services-list.tsx         # Tanstack table with search, status + server filter
        ├── service-details.tsx       # Service detail view (sections: basic, SSL/backup, billing)
        ├── service-details-modal.tsx # Modal wrapper for service-details
        └── upload/
            ├── index.tsx             # UploadServiceDialog — Dialog wrapper (create & edit)
            └── form.tsx              # ServiceUploadForm — form with server selector
```

---

## App Routes

| Route | File | Description |
|---|---|---|
| `/dashboard/infrastructure/servers` | `src/app/[locale]/dashboard/(auth)/infrastructure/servers/` | Servers list page |
| `/dashboard/infrastructure/services` | `src/app/[locale]/dashboard/(auth)/infrastructure/services/` | Services list page |

Each route uses a `page.tsx` → `render.tsx` split: `page.tsx` handles metadata generation, `render.tsx` is the client component that checks permissions and renders the list + upload button.

---

## API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| List servers | `GET` | `/servers?page=&limit=&name=&searchBy=&statuses=` |
| Create server | `POST` | `/servers` |
| Update server | `PATCH` | `/servers/:id` |
| List services | `GET` | `/servers/services?page=&limit=&name=&statuses=&serversIds=` |
| Create service | `POST` | `/servers/services` |
| Update service | `PATCH` | `/servers/services/:id` |

All requests are authenticated with a JWT `Bearer` token. On `401`, the module automatically calls `refreshToken()` and retries once before redirecting to `/login`.

---

## Data Flow

```
Page (render.tsx)
 └─ permission check: hasPermissions(user.roles, "serversManagement", "view")
     └─ ServersList / ServicesList (component)
         └─ useServers / useServices (hook)
             └─ retrieveServersFromServerSide (service)
                 └─ GET /servers  →  castToServerType (DTO)  →  ServerType[]
         └─ UploadServerDialog (on Add / Edit)
             └─ useServerUpload (hook)
                 └─ cleanServerDataToUpload (DTO)
                     └─ POST /servers  or  PATCH /servers/:id
                         └─ invalidates ["infrastructure"] React Query cache
```

---

## Permissions

UI actions are gated via `hasPermissions(user.roles, key, action)`:

| Permission Key | Actions |
|---|---|
| `serversManagement` | `view`, `add`, `edit`, `delete` |
| `servicesManagement` | `view`, `add`, `edit`, `delete` |

---

## i18n Keys

All user-facing strings live under `modules.infrastructure` in the locale files (`messages/en.json`, etc.):

```
modules.infrastructure
├── servers
│   ├── title, list, statuses, search, filters, table, columnsDropdown
│   ├── serverDetails.modal / serverDetails.details
│   ├── upload.createServer / upload.updateServer / upload.form
│   └── deletion.confirmation
├── services
│   ├── title, statuses, filters, table, columnsDropdown
│   ├── serviceDetails.modal / serviceDetails.sections / serviceDetails.fields
│   ├── upload.createService / upload.updateService / upload.form
│   └── deletion.confirmation
├── validations.servers   # Zod form validation messages
├── validations.services  # Zod form validation messages
├── errors.servers        # API error messages
└── errors.services       # API error messages
```

---

## Error Handling

Upload hooks handle the following HTTP error codes uniformly:

| Status | Code | Behaviour |
|---|---|---|
| `401` | — | Redirect to `/login` |
| `400` | `P2000` / `SERVER_ALREADY_EXIST` / `SERVICE_ALREADY_EXIST` | Toast + inline error banner |
| `400` | other | "Invalid format" toast |
| `403` | — | "Permission denied" toast |
| `500` | — | "Server error" toast |
