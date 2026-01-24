# Dashboard API Documentation

This documentation covers all APIs used by company owners (tenants) to manage their RAG service through the dashboard.

**Base URL:** `http://your-domain.com/api/v1`

## Table of Contents

1. [Authentication](#authentication)
2. [Tenant Management](#tenant-management)
3. [Document Management](#document-management)
4. [Pending Questions](#pending-questions)
5. [Feedback Analytics](#feedback-analytics)
6. [Telegram Bot Integration](#telegram-bot-integration)
7. [Admin APIs](#admin-apis-super-admin-only)

---

## Standard Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Authentication

### Register

Create a new account.

```
POST /register
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}
```

---

### Login

Authenticate and receive a JWT token.

```
POST /login
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Logout

Invalidate the current session.

```
POST /logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

Request a password reset email.

```
POST /forgot-password
```

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Reset password using the token from email.

```
POST /reset-password
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Tenant Management

All tenant APIs require JWT authentication.

**Headers (for all requests below):**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Create Tenant

Create a new tenant (project/workspace).

```
POST /tenants
```

**Request Body:**
```json
{
  "name": "My Company Support",
  "plan": "pro"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tenant name |
| plan | string | No | Plan type: `free`, `pro`, `enterprise` (default: `free`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "My Company Support",
      "plan": "pro",
      "status": "active",
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "api_keys": {
      "public_key": {
        "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "prefix": "pk_xxxxxxxx",
        "type": "public",
        "rate_limit": 1000,
        "use": "Client-side SDK (web/mobile). Safe to expose. Chat-only access."
      },
      "secret_key": {
        "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "prefix": "sk_xxxxxxxx",
        "type": "secret",
        "rate_limit": -1,
        "use": "Server-side (document upload, admin). Never expose!"
      }
    }
  },
  "message": "Tenant created successfully"
}
```

> **Important:** Save both API keys securely. The full keys are only shown once!

---

### List My Tenants

Get all tenants owned by the authenticated user.

```
GET /tenants
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "My Company Support",
        "plan": "pro",
        "status": "active",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### Get Tenant Details

Get details for a specific tenant including API key metadata.

```
GET /tenants/{tenant_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "My Company Support",
      "plan": "pro",
      "status": "active",
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "api_keys": [
      {
        "id": "uuid",
        "prefix": "pk_xxxxxxxx",
        "type": "public",
        "rate_limit": 1000,
        "created_at": "2026-01-24T10:00:00Z"
      },
      {
        "id": "uuid",
        "prefix": "sk_xxxxxxxx",
        "type": "secret",
        "rate_limit": -1,
        "created_at": "2026-01-24T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Additional API Key

Generate additional API keys for a tenant.

```
POST /tenants/{tenant_id}/api-keys
```

**Request Body:**
```json
{
  "type": "public",
  "rate_limit": 500
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | No | `public` or `secret` (default: `secret`) |
| rate_limit | int | No | Requests per hour (default: 100, -1 for unlimited) |

**Response:**
```json
{
  "success": true,
  "data": {
    "api_key": {
      "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "prefix": "pk_xxxxxxxx",
      "type": "public",
      "rate_limit": 500
    }
  },
  "message": "API key created successfully"
}
```

---

## Document Management

Manage knowledge base documents for your tenant.

### Upload Document

Upload a document to the knowledge base.

```
POST /tenants/{tenant_id}/documents
```

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Document file (.txt, .md, .json, .html, .docx) |

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "name": "product-guide.md",
      "file_type": "text/markdown",
      "status": "processing"
    }
  },
  "message": "Document uploaded successfully"
}
```

---

### Ingest URL

Scrape and ingest content from a website URL.

```
POST /tenants/{tenant_id}/documents/ingest-url
```

**Request Body:**
```json
{
  "url": "https://example.com/about"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "url": "https://example.com/about",
    "status": "processing"
  },
  "message": "URL ingestion started"
}
```

---

### List Documents

Get all documents for a tenant.

```
GET /tenants/{tenant_id}/documents
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "name": "product-guide.md",
        "file_type": "text/markdown",
        "file_size": 15420,
        "status": "completed",
        "created_at": "2026-01-24T10:00:00Z"
      }
    ]
  }
}
```

---

### Delete Document

Delete a document from the knowledge base.

```
DELETE /tenants/{tenant_id}/documents/{document_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Pending Questions

Manage unanswered questions from users.

### List Pending Questions

Get questions that the bot couldn't answer.

```
GET /tenants/{tenant_id}/pending-questions
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter: `all`, `pending`, `answered` (default: `all`) |
| page | int | No | Page number (default: 1) |
| limit | int | No | Items per page (default: 20, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "uuid",
        "question": "What are your business hours?",
        "status": "pending",
        "chat_id": "uuid",
        "created_at": "2026-01-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

### Submit Answer

Answer a pending question. The answer is stored in the knowledge base.

```
POST /tenants/{tenant_id}/pending-questions/{pending_question_id}/answer
```

**Request Body:**
```json
{
  "answer": "Our business hours are Monday to Friday, 9 AM to 6 PM.",
  "is_faq": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| answer | string | Yes | The answer to the question |
| is_faq | boolean | No | Mark as FAQ for priority matching (default: false) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "answered"
  },
  "message": "Answer submitted successfully"
}
```

> **Note:** If `is_faq: true`, similar questions will instantly return this answer without calling the AI.

---

## Feedback Analytics

Monitor user satisfaction with bot responses.

### Get Feedback Statistics

Get aggregated feedback stats for a tenant.

```
GET /tenants/{tenant_id}/feedback/stats
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string | No | Filter from date (YYYY-MM-DD) |
| end_date | string | No | Filter to date (YYYY-MM-DD) |

**Response:**
```json
{
  "success": true,
  "data": {
    "total_feedback": 150,
    "positive_count": 120,
    "negative_count": 30,
    "positive_percent": 80.0,
    "negative_percent": 20.0
  }
}
```

---

### List Feedback

Get detailed feedback with message content.

```
GET /tenants/{tenant_id}/feedback
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter: `all`, `positive`, `negative` (default: `all`) |
| page | int | No | Page number (default: 1) |
| limit | int | No | Items per page (default: 20, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": "uuid",
        "feedback_type": "negative",
        "comment": "The answer was not accurate",
        "user_question": "What are your refund policies?",
        "message_content": "We offer 30-day refunds on all products.",
        "chat_title": "Support Chat",
        "created_at": "2026-01-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "total_pages": 2
    }
  }
}
```

---

### Submit Feedback (JWT)

Submit feedback for a message (for testing purposes).

```
POST /tenants/{tenant_id}/chats/{chat_id}/messages/{message_id}/feedback
```

**Request Body:**
```json
{
  "feedback_type": "positive",
  "comment": "Very helpful response!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "feedback_type": "positive",
    "message": "Feedback submitted successfully"
  }
}
```

---

## Telegram Bot Integration

Connect a Telegram bot to your tenant.

### Set Telegram Bot Token

Configure a Telegram bot for your tenant.

```
POST /tenants/{tenant_id}/telegram/bot-token
```

**Request Body:**
```json
{
  "bot_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bot_username": "MyCompanyBot",
    "bot_id": 123456789,
    "message": "Telegram bot token set successfully"
  }
}
```

**Next Steps:**
1. Register the webhook with Telegram:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://your-domain.com/webhooks/telegram?token=<BOT_TOKEN>"
```

2. The bot will now respond to messages using your knowledge base.

---

## Admin APIs

Administrative APIs for managing users and tenants. Access is controlled by user roles.

### Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| `user` | 1 | Standard user - can create and manage own tenants |
| `admin` | 2 | Administrator - can manage users (except super_admin) |
| `super_admin` | 3 | Super Administrator - full system access |
| `disabled` | 0 | Disabled account - no access |

### Role Permissions Matrix

| Action | user | admin | super_admin |
|--------|------|-------|-------------|
| Create/manage own tenants | ✅ | ✅ | ✅ |
| List all users | ❌ | ✅ | ✅ |
| Update user roles | ❌ | ✅ | ✅ |
| Disable/delete users | ❌ | ✅ | ✅ |
| List all tenants | ❌ | ❌ | ✅ |
| Update tenant status | ❌ | ❌ | ✅ |
| Delete any tenant | ❌ | ❌ | ✅ |
| Initialize admin | ❌ | ✅ | ✅ |

---

## Admin APIs - User Management

**Required Role:** `admin` or `super_admin`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Initialize Admin

Promote the first admin user (one-time setup).

```
POST /admin/init
```

**Response:**
```json
{
  "success": true,
  "message": "Admin initialized successfully"
}
```

---

### List All Users

Get all registered users in the system.

```
GET /admin/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@company.com",
        "name": "John Doe",
        "role": "user",
        "created_at": "2026-01-24T10:00:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "admin@company.com",
        "name": "Admin User",
        "role": "admin",
        "created_at": "2026-01-20T08:00:00Z"
      }
    ]
  }
}
```

---

### Update User Role

Change a user's role/permissions.

```
PUT /admin/users/{user_id}/role
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid Roles:**
| Role | Description |
|------|-------------|
| `user` | Standard user - can create and manage own tenants |
| `admin` | Administrator - can manage users |
| `super_admin` | Super Administrator - full access |
| `disabled` | Disables the account |

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully"
}
```

**Example:**
```bash
# Promote user to admin
curl -X PUT http://localhost:8080/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'

# Disable a user
curl -X PUT http://localhost:8080/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "disabled"}'
```

---

### Disable User

Disable a user account (shortcut for setting role to "disabled").

```
DELETE /admin/users/{user_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Response:**
```json
{
  "success": true,
  "message": "User disabled successfully"
}
```

> **Note:** This sets the user's role to "disabled". The account still exists but cannot log in.

---

### Delete User

Permanently delete a user account.

```
DELETE /admin/users/{user_id}/delete
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

> **Warning:** This action is irreversible. Consider disabling the user first.

---

## Admin APIs - Tenant Management

**Required Role:** `super_admin` only

These APIs allow super administrators to manage all tenants in the system.

### List All Tenants

Get all tenants across the entire platform.

```
GET /admin/tenants
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "name": "Acme Corp Support",
        "plan": "pro",
        "status": "active"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440101",
        "name": "TechStart Help",
        "plan": "free",
        "status": "active"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440102",
        "name": "Spam Company",
        "plan": "free",
        "status": "suspended"
      }
    ],
    "total": 3
  }
}
```

---

### Update Tenant Status

Change a tenant's operational status.

```
PUT /admin/tenants/{tenant_id}/status
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Valid Statuses:**
| Status | Description | Effect |
|--------|-------------|--------|
| `active` | Normal operation | All APIs work normally |
| `suspended` | Temporarily disabled | APIs return 403 Forbidden |
| `blocked` | Permanently blocked | APIs return 403 Forbidden |

**Response:**
```json
{
  "success": true,
  "message": "Tenant status updated successfully"
}
```

**Example Use Cases:**
```bash
# Suspend a tenant for non-payment
curl -X PUT http://localhost:8080/api/v1/admin/tenants/550e8400-e29b-41d4-a716-446655440102/status \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'

# Reactivate a tenant
curl -X PUT http://localhost:8080/api/v1/admin/tenants/550e8400-e29b-41d4-a716-446655440102/status \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# Block a tenant for ToS violation
curl -X PUT http://localhost:8080/api/v1/admin/tenants/550e8400-e29b-41d4-a716-446655440102/status \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked"}'
```

---

### Delete Tenant

Permanently delete a tenant and all associated data.

```
DELETE /admin/tenants/{tenant_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |

**Response:**
```json
{
  "success": true,
  "message": "Tenant deleted successfully"
}
```

**Error Response (if tenant has documents):**
```json
{
  "success": false,
  "error": "Cannot delete tenant with existing documents"
}
```

> **Warning:** This action is irreversible. The tenant must have no documents before deletion. Consider suspending the tenant instead.

---

## Admin Quick Reference

### User Management (admin, super_admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/init` | Initialize first admin |
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/{id}/role` | Update user role |
| DELETE | `/admin/users/{id}` | Disable user |
| DELETE | `/admin/users/{id}/delete` | Delete user |

### Tenant Management (super_admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/tenants` | List all tenants |
| PUT | `/admin/tenants/{id}/status` | Update tenant status |
| DELETE | `/admin/tenants/{id}` | Delete tenant |

---

## Admin Workflow Examples

### 1. Initial Setup (First Admin)

```bash
# 1. Register first user
curl -X POST http://localhost:8080/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "adminPass123", "name": "System Admin"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "adminPass123"}' | jq -r '.data.token')

# 3. Manually update role in database (one-time):
# UPDATE users SET role = 'super_admin' WHERE email = 'admin@company.com';

# 4. Or initialize via API (if available)
curl -X POST http://localhost:8080/api/v1/admin/init \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Onboard New Admin

```bash
# As super_admin, promote existing user to admin
curl -X PUT http://localhost:8080/api/v1/admin/users/$USER_ID/role \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### 3. Handle Abusive Tenant

```bash
# Step 1: Suspend immediately
curl -X PUT http://localhost:8080/api/v1/admin/tenants/$TENANT_ID/status \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'

# Step 2: After investigation, either reactivate or block
curl -X PUT http://localhost:8080/api/v1/admin/tenants/$TENANT_ID/status \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked"}'
```

### 4. Deactivate Former Employee

```bash
# Disable their account
curl -X DELETE http://localhost:8080/api/v1/admin/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Error Codes

| HTTP Code | Description |
|-----------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist or access denied |
| 500 | Internal Server Error |

---

## Quick Start Example

```bash
# 1. Register
curl -X POST http://localhost:8080/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"email": "me@company.com", "password": "secret123", "name": "John"}'

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email": "me@company.com", "password": "secret123"}' | jq -r '.data.token')

# 3. Create Tenant
curl -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Support Bot", "plan": "pro"}'

# 4. Upload Document (replace TENANT_ID)
curl -X POST http://localhost:8080/api/v1/tenants/TENANT_ID/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@knowledge-base.md"

# 5. Check Pending Questions
curl http://localhost:8080/api/v1/tenants/TENANT_ID/pending-questions \
  -H "Authorization: Bearer $TOKEN"

# 6. View Feedback Stats
curl http://localhost:8080/api/v1/tenants/TENANT_ID/feedback/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## SDK Integration

After creating a tenant, use the **public API key** in your client-side SDK:

```javascript
// Web SDK Example
const ragClient = new LightRAG({
  publicKey: 'pk_xxxxxxxx-xxxx-...',
  baseUrl: 'https://your-domain.com/api/v1'
});

// Create a chat session
const chat = await ragClient.createChat();

// Send a message
const response = await ragClient.sendMessage(chat.id, "What are your hours?");

// Submit feedback
await ragClient.submitFeedback(chat.id, response.messageId, 'positive');
```

For detailed SDK documentation, see [SDK_FLOW.md](./SDK_FLOW.md).
