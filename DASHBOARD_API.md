# Dashboard API Documentation

This documentation covers all APIs used by company owners (tenants) to manage their RAG service through the dashboard.

**Base URL:** `http://your-domain.com/api/v1`

## Table of Contents

0. [Plan Limitations](#plan-limitations)
0.5. [Localization](#localization)
1. [Authentication](#authentication)
   - [Register](#register), [Verify Email](#verify-email), [Resend Verification Email](#resend-verification-email), [Login](#login), [Logout](#logout), [Forgot Password](#forgot-password), [Reset Password](#reset-password)
2. [Tenant Management](#tenant-management)
   - [Create Tenant](#create-tenant)
   - [List My Tenants](#list-my-tenants)
   - [Get Tenant Details](#get-tenant-details)
   - [Create Additional API Key](#create-additional-api-key)
   - [List API Keys](#list-api-keys)
   - [Get API Key](#get-api-key)
   - [Get Tenant Settings](#get-tenant-settings) / [Update Tenant Settings](#update-tenant-settings)
   - [List Tenant Chats](#list-tenant-chats)
   - [List Tenant Chat Messages](#list-tenant-chat-messages)
3. [Billing & Subscriptions](#billing--subscriptions)
   - [List Plans](#list-plans)
   - [Create Checkout Session](#create-checkout-session)
   - [Get My Subscription](#get-my-subscription)
   - [Change Plan](#change-plan)
   - [Change Gateway](#change-gateway)
   - [Cancel Subscription](#cancel-subscription)
4. [Document Management](#document-management)
   - [Upload Document](#upload-document)
   - [Ingest URL](#ingest-url)
   - [List Documents](#list-documents)
   - [Get Document Status](#get-document-status)
   - [Replace Document](#replace-document)
   - [Replace Document URL](#replace-document-url)
   - [Delete Document](#delete-document)
5. [Pending Questions](#pending-questions)
6. [Feedback Analytics](#feedback-analytics)
7. [Telegram Bot Integration](#telegram-bot-integration)
8. [Custom System Prompt](#custom-system-prompt)
9. [Structured Entity Extraction](#structured-entity-extraction)
10. [Admin APIs](#admin-apis-super-admin-only)
   - [User Management](#admin-apis---user-management)
   - [Tenant Management](#admin-apis---tenant-management)
   - [User Subscription & Tenants](#admin-apis---user-subscription--tenants)
   - [Tenant Chats, Messages & Analytics](#admin-apis---tenant-chats-messages--analytics)
   - [Plan Management](#admin-apis---plan-management)

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

## Plan Limitations

**Important:** Plans are attached at the **user level**, not the tenant level. Your subscription determines the limits and features for **all** of your tenants (projects).

### Limit Types

| Resource | Limit | Applied To |
|----------|-------|------------|
| **Projects/Tenants** | `max_projects` | Total number of tenants a user can create |
| **Documents** | `max_documents` | Total documents across all user's tenants |
| **Document Size** | `max_document_size_mb` | Maximum file size per document upload |
| **URL Ingests** | `max_urls_ingest_per_month` | Website scrapings per month (all tenants) |
| **Messages** | `max_messages_per_month` | Chat messages per month (all tenants) |
| **API Keys** | `max_api_keys_per_tenant` | API keys per individual tenant |
| **Feedback Events** | `max_feedback_events_per_month` | Feedback submissions per month |

### Default Plan Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Projects (tenants) | 1 | 5 | Unlimited |
| Documents | 10 | 1000 | Unlimited |
| Document Size | 10 MB | 20 MB | 100 MB |
| Messages/Month | 1,000 | 50,000 | Unlimited |
| URL Ingests/Month | 10 | 500 | Unlimited |
| API Keys/Tenant | 5 | 10 | Unlimited |
| Telegram Integration | ❌ | ✅ | ✅ |
| Feedback Analytics | ❌ | ✅ | ✅ |
| Custom System Prompt | ❌ | ✅ | ✅ |
| RAG Enhancements | ❌ | ✅ | ✅ |

### Limit Enforcement

When a limit is reached, the API returns a **403 Forbidden** response with an error message indicating the limit that was reached:

```json
{
  "success": false,
  "error": "You have reached your plan limit of 1 projects/tenants. Upgrade your plan to create more."
}
```

```json
{
  "success": false,
  "error": "You have reached your plan limit of 1000 documents. Upgrade your plan to upload more."
}
```

```json
{
  "success": false,
  "error": "You have reached your plan limit of 50,000 messages per month. Upgrade your plan for more."
}
```

### Checking Your Plan

Use the **[Get My Subscription](#get-my-subscription)** endpoint to check your current plan and limits.

---

## Localization

The API supports localization for plan-related content. You can request plan names, descriptions, and features in different languages by sending the `Accept-Language` header.

### Accept-Language Header

```
Accept-Language: ar
```

**Supported Languages:**

| Code | Language |
|------|----------|
| `en` | English (default) |
| `ar` | Arabic |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `pt` | Portuguese |
| `ru` | Russian |
| `zh` | Chinese |
| `ja` | Japanese |
| `ko` | Korean |
| `tr` | Turkish |

### How It Works

1. Send the `Accept-Language` header with your preferred language code
2. The API returns localized `name`, `description`, and `features_summary` for plans
3. If a localization doesn't exist for the requested language, English content is returned as fallback

### Example Request

```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept-Language: ar" \
     https://your-domain.com/api/v1/billing/plans
```

### Example Response (Arabic)

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "name": "المحترف",
        "slug": "pro",
        "description": "للفرق المتنامية",
        "features_summary": "10 مشاريع، 50 ألف رسالة شهرياً",
        ...
      }
    ]
  }
}
```

### Managing Localizations (Admin)

Plan localizations are managed at the database level. Contact your administrator to add localizations for new languages.

---

## Authentication

**Auth flow:** Register → user receives a verification email → user clicks link or calls [Verify Email](#verify-email) with the token → then [Login](#login) returns a JWT. Login is rejected until the user has verified their email.

**Token and link validity (SMTP emails):**

| Link type | Email trigger | Link URL pattern | Token validity |
|-----------|---------------|------------------|----------------|
| **Verify email** | Register or [Resend Verification Email](#resend-verification-email) | `{FRONTEND_URL}/verify-email?token=...` | 24 hours, single-use |
| **Forgot password** | [Forgot Password](#forgot-password) | `{FRONTEND_URL}/reset-password?token=...` | 1 hour, single-use |

`FRONTEND_URL` is the frontend domain (set via `FRONTEND_URL` env var, falls back to `BASE_URL` if not set). Email links point to the frontend; the dashboard reads `token` from the query and calls the corresponding API.

### Register

Create a new account. **No JWT is returned.** A verification email is sent; the user must verify their email (via the link or the Verify Email API) before they can log in. Requires SMTP to be configured (`SMTP_HOST`, etc.).

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

| Field    | Type   | Required | Description                          |
|----------|--------|----------|--------------------------------------|
| email    | string | Yes      | User email                           |
| password | string | Yes      | Min 6 characters                     |
| name     | string | No       | Display name                         |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "role": "user",
      "tenant_id": "",
      "email_verified": false,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    }
  },
  "message": "Please check your email to verify your account"
}
```

**Error (400):** `user already exists` | `email verification is not configured; set SMTP_HOST and related env vars` | other validation errors.

---

### Verify Email

Verify the user's email using the token from the verification link sent after registration. On success, returns **user + token** (same shape as Login); the dashboard can store the token and treat the user as logged in. Token is valid for 24 hours and is single-use.

```
POST /verify-email
```

**Request Body:**
```json
{
  "token": "token-from-verification-email-link"
}
```

The token is the `token` query parameter from the verification link (e.g. `https://your-frontend.com/verify-email?token=...`). The dashboard should read it from the URL and send it in the body.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "role": "user",
      "tenant_id": "",
      "email_verified": true,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (400):** `invalid or expired verification link` | `Token is required`

---

### Resend Verification Email

Request a new verification email for an address that was used to register but has not yet verified. Use this when the user did not receive the first email or the link expired (tokens are valid 24 hours). For privacy, the API always returns the same success message whether the email exists and was unverified or not; no indication of "email not found" or "already verified" is given.

```
POST /resend-verification-email
```

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If that email is registered and not yet verified, a new verification link has been sent."
}
```

**Error (503):** `email verification is not configured; set SMTP_HOST and related env vars` (when SMTP is not configured).

---

### Login

Authenticate and receive a JWT token. **Fails if the user has not verified their email** (they must complete [Verify Email](#verify-email) first).

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

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "role": "user",
      "tenant_id": "",
      "email_verified": true,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401):** `invalid credentials` | `please verify your email before signing in; check your inbox for the verification link` | `account disabled`

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

Request a password reset email. The user receives a link of the form `{BASE_URL}/reset-password?token=...`. The token is **valid for 1 hour** and single-use. The dashboard should send that token (and the user's email) to [Reset Password](#reset-password) when the user submits a new password.

```
POST /forgot-password
```

**Request Body:**
```json
{
  "email": "user@company.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

Requires SMTP to be configured.

---

### Reset Password

Reset password using the token from the forgot-password email. Token is the `token` query parameter from the link (`{BASE_URL}/reset-password?token=...`). Token is valid for **1 hour** and single-use.

```
POST /reset-password
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "token": "reset-token-from-email-link",
  "password": "newSecurePassword123"
}
```

| Field    | Type   | Required | Description                                |
|----------|--------|----------|--------------------------------------------|
| email    | string | Yes      | Same email used in Forgot Password         |
| token    | string | Yes      | Token from the reset link (`?token=...`)   |
| password | string | Yes      | New password (min 6 characters)           |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error (400):** `invalid or expired reset token` | validation errors

---

## Tenant Management

All tenant APIs require JWT authentication.

**Headers (for all requests below):**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Create Tenant

Create a new tenant (project/workspace). The tenant uses the limits and features from your subscription plan.

```
POST /tenants
```

**Request Body:**
```json
{
  "name": "My Company Support"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tenant name |

**Limitations:**
- You can create up to the number of projects/tenants allowed by your subscription plan
- Free plan: 1 tenant
- Pro plan: 5 tenants (default, configurable)
- Enterprise plan: unlimited tenants

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "My Company Support",
      "status": "active",
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "plan": {
      "id": "plan-uuid",
      "name": "Pro",
      "slug": "pro"
    },
    "api_keys": {
      "public_key": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "prefix": "pk_xxxxxxxx",
        "type": "public",
        "rate_limit": 1000,
        "use": "Client-side SDK (web/mobile). Safe to expose. Chat-only access."
      },
      "secret_key": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "prefix": "sk_xxxxxxxx",
        "type": "secret",
        "rate_limit": -1,
        "use": "Server-side (document upload, admin). Never expose!"
      }
    },
    "message": "Tenant created successfully. Save your API keys now! Use GET /tenants/{tenant_id}/api-keys/{key_id} to retrieve them later."
  },
  "message": "Tenant created successfully"
}
```

> **Important:** Save both API keys securely when they are shown. You can retrieve them later using `GET /tenants/{tenant_id}/api-keys/{key_id}` with the key ID.

**Error Response (Tenant Limit Reached):**
```json
{
  "success": false,
  "error": "You have reached your plan limit of 1 projects/tenants. Upgrade your plan to create more."
}
```

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

> **Note:** This endpoint returns API key metadata (IDs, prefixes, types) only. Use `GET /tenants/{tenant_id}/api-keys/{key_id}` to retrieve the actual keys.

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
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "prefix": "pk_xxxxxxxx",
      "type": "public",
      "rate_limit": 500
    },
    "message": "API key created successfully. Save this key now - it will not be shown again. Use GET /tenants/{tenant_id}/api-keys/{key_id} to retrieve it later."
  },
  "message": "API key created successfully"
}
```

> **Note:** The key is only shown once in this response. Save it immediately or use `GET /tenants/{tenant_id}/api-keys/{key_id}` to retrieve it later.

---

### List API Keys

Get all API keys for a tenant (metadata only - prefixes, types, rate limits).

```
GET /tenants/{tenant_id}/api-keys
```

**Response:**
```json
{
  "success": true,
  "data": {
    "api_keys": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "prefix": "pk_xxxxxxxx",
        "type": "public",
        "rate_limit": 1000,
        "created_at": "2026-01-24T10:00:00Z",
        "last_used_at": "2026-01-24T15:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "prefix": "sk_xxxxxxxx",
        "type": "secret",
        "rate_limit": -1,
        "created_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 2
  }
}
```

> **Note:** This endpoint returns metadata only (prefixes, types, IDs). Use `GET /tenants/{tenant_id}/api-keys/{key_id}` to retrieve the actual key.

---

### Get API Key

Retrieve the actual API key by its ID. The key is decrypted and returned.

```
GET /tenants/{tenant_id}/api-keys/{key_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |
| key_id | uuid | The API key's ID (from list or create response) |

**Response:**
```json
{
  "success": true,
  "data": {
    "api_key": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "prefix": "pk_xxxxxxxx",
      "type": "public",
      "rate_limit": 1000,
      "created_at": "2026-01-24T10:00:00Z"
    }
  }
}
```

**Error Response (Key Not Found):**
```json
{
  "success": false,
  "error": "API key not found"
}
```

**Error Response (Key Cannot Be Retrieved):**
```json
{
  "success": false,
  "error": "API key cannot be retrieved (created before encryption was enabled)"
}
```

> **Note:** Keys created before encryption was enabled cannot be retrieved. Only keys created after the encryption feature was added can be retrieved using this endpoint.

**Example:**
```bash
# 1. List all keys to get the key ID
curl http://localhost:8080/api/v1/tenants/{tenant_id}/api-keys \
  -H "Authorization: Bearer $JWT_TOKEN"

# 2. Retrieve the actual key using the ID
curl http://localhost:8080/api/v1/tenants/{tenant_id}/api-keys/{key_id} \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Get Tenant Settings

Get per-tenant answer and chat settings (answer style, message limit per chat, extra settings). These affect how the assistant responds and how many messages are allowed per chat.

```
GET /tenants/{tenant_id}/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer_style": "formal",
    "message_limit_per_chat": 100,
    "settings": {}
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| answer_style | string \| null | `short`, `formal`, `friendly`, `detailed`, or null for default |
| message_limit_per_chat | number \| null | Max messages per chat; null = no limit |
| settings | object | Extra key-value settings (e.g. language, max_tokens) |

---

### Update Tenant Settings

Set answer style, message limit per chat, and optional extra settings. Affects all chats for this tenant.

```
PUT /tenants/{tenant_id}/settings
```

**Request Body:**
```json
{
  "answer_style": "short",
  "message_limit_per_chat": 50,
  "settings": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| answer_style | string | No | One of: `short`, `formal`, `friendly`, `detailed`; empty string = default |
| message_limit_per_chat | number \| null | No | Max messages per chat; null = no limit. Must be ≥ 1 if set. |
| settings | object | No | Extra key-value; use `{}` to clear |

**Answer styles:** `short` = brief answers; `formal` = professional tone; `friendly` = warm tone; `detailed` = thorough when possible.

When a chat reaches `message_limit_per_chat`, the API returns an error and the user must start a new chat or the tenant can increase the limit.

**Response:**
```json
{
  "success": true,
  "message": "Tenant settings updated"
}
```

---

### List Tenant Chats

List chats for a tenant you own (for dashboard management). Paginated.

```
GET /tenants/{tenant_id}/chats
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "uuid",
        "tenant_id": "uuid",
        "title": "Chat title or null",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### List Tenant Chat Messages

List messages for a specific chat (tenant you own). Paginated.

```
GET /tenants/{tenant_id}/chats/{chat_id}/messages
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "tenant_id": "uuid",
        "chat_id": "uuid",
        "role": "user",
        "content": "What are your pricing plans?",
        "token_usage": {},
        "created_at": "2026-01-24T10:00:00Z"
      },
      {
        "id": "uuid",
        "tenant_id": "uuid",
        "chat_id": "uuid",
        "role": "assistant",
        "content": "We offer three plans: Basic at $19/month, Premium at $49/month, and Enterprise at $99/month.",
        "token_usage": {
          "sources": [
            {
              "document_id": "doc-uuid",
              "document_name": "pricing.md",
              "chunk_index": 2,
              "score": 0.92,
              "snippet": "Basic Plan: $19/month\nPremium Plan: $49/month"
            }
          ],
          "confidence": 0.92
        },
        "entities": {
          "products": [
            {"name": "Basic Plan", "price": "$19/month"},
            {"name": "Premium Plan", "price": "$49/month"},
            {"name": "Enterprise Plan", "price": "$99/month"}
          ],
          "pricing": [
            {"product": "Basic Plan", "price": "$19", "period": "monthly"},
            {"product": "Premium Plan", "price": "$49", "period": "monthly"},
            {"product": "Enterprise Plan", "price": "$99", "period": "monthly"}
          ]
        },
        "created_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

**Structured Entities:**

Assistant messages include an `entities` field with structured data extracted from the response and knowledge base:

| Entity Type | Description | Example Fields |
|-------------|-------------|----------------|
| `products` | Products mentioned | name, price, description, url, image_url |
| `services` | Services offered | name, description, features[] |
| `urls` | Links found | url, title, anchor_text |
| `contacts` | Contact info | type (email/phone), value, label |
| `pricing` | Pricing details | product, price, currency, period |
| `locations` | Addresses | name, address, city, country |

> **Note:** Entities are only extracted for SDK/API calls. Webhook endpoints (Telegram, etc.) receive plain text only.

---

## Billing & Subscriptions

All billing APIs require JWT authentication. Users can subscribe via **Stripe** or **CryptoCloud**, view their subscription, change plan or gateway (scheduled for next cycle), and cancel.

**Headers (for all requests below):**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### List Plans

Get all active plans for the pricing page or dashboard.

```
GET /billing/plans
```

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer JWT token |
| Accept-Language | string | No | Language code for localized plan content (e.g., `en`, `ar`, `es`, `fr`). Default: `en` |

**Supported Languages:** `en` (English), `ar` (Arabic), `es` (Spanish), `fr` (French), `de` (German), `it` (Italian), `pt` (Portuguese), `ru` (Russian), `zh` (Chinese), `ja` (Japanese), `ko` (Korean), `tr` (Turkish)

**Localization:** Plan `name`, `description`, and `features_summary` fields are returned in the requested language if available. If no localization exists for the requested language, English content is returned as fallback.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "b6215202-d167-45c1-a2dd-6d037fafee50",
        "name": "Pro",
        "slug": "pro",
        "description": "For growing teams",
        "currency": "USD",
        "price_monthly_cents": 2900,
        "price_yearly_cents": 29000,
        "is_active": true,
        "sort_order": 1,
        "features_summary": "10 projects, 50k messages/mo",
        "max_projects": 10,
        "max_messages_per_month": 50000,
        "max_documents": 500,
        "enable_telegram_integration": true,
        "enable_feedback": true,
        "enable_custom_system_prompt": true,
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Checkout Session

Start checkout for a plan with the chosen payment provider. Returns a URL to redirect the user to complete payment (Stripe Checkout or CryptoCloud payment page).

```
POST /billing/checkout
```

**Request Body:**
```json
{
  "plan_id": "b6215202-d167-45c1-a2dd-6d037fafee50",
  "provider": "stripe",
  "period": "monthly"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| plan_id | string (uuid) | Yes | Plan to subscribe to |
| provider | string | Yes | `stripe` or `cryptocloud` |
| period | string | Yes | `monthly` or `yearly` |

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_...",
    "provider": "stripe",
    "plan_id": "b6215202-d167-45c1-a2dd-6d037fafee50",
    "period": "monthly"
  }
}
```

Redirect the user to `checkout_url` to complete payment. After success, the provider sends a webhook to your server and the subscription is activated.

---

### Get My Subscription

Get the current subscription for the authenticated user.

```
GET /billing/subscription
```

**Headers:**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer JWT token |
| Accept-Language | string | No | Language code for localized plan content (e.g., `ar`, `en`). Default: `en` |

The `plan` object in the response includes localized `name`, `description`, and `features_summary` based on the `Accept-Language` header.

**Response (has subscription):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "user_id": "uuid",
      "plan_id": "b6215202-d167-45c1-a2dd-6d037fafee50",
      "provider": "stripe",
      "provider_subscription_id": "sub_xxx",
      "provider_customer_id": "cus_xxx",
      "status": "active",
      "current_period_start": "2026-01-24T00:00:00Z",
      "current_period_end": "2026-02-24T00:00:00Z",
      "cancel_at_period_end": false,
      "scheduled_plan_id": null,
      "scheduled_provider": null,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    },
    "plan": {
      "id": "b6215202-d167-45c1-a2dd-6d037fafee50",
      "name": "Pro",
      "slug": "pro",
      "currency": "USD",
      "price_monthly_cents": 2900,
      "price_yearly_cents": 29000
    }
  }
}
```

**Response (no subscription):**
```json
{
  "success": true,
  "data": {
    "subscription": null,
    "message": "No active subscription"
  }
}
```

---

### Change Plan

Schedule a plan change at the end of the current billing period.

```
POST /billing/subscription/change-plan
```

**Request Body:**
```json
{
  "plan_id": "b6215202-d167-45c1-a2dd-6d037fafee50"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| plan_id | string (uuid) | Yes | Target plan ID |

**Response:**
```json
{
  "success": true,
  "message": "Plan change scheduled for next billing cycle"
}
```

---

### Change Gateway

Schedule a switch to a different payment provider (Stripe or CryptoCloud) at the end of the current billing period.

```
POST /billing/subscription/change-gateway
```

**Request Body:**
```json
{
  "provider": "cryptocloud"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| provider | string | Yes | `stripe` or `cryptocloud` |

**Response:**
```json
{
  "success": true,
  "message": "Payment gateway change scheduled for next billing cycle"
}
```

---

### Cancel Subscription

Cancel the subscription at the end of the current billing period. Access continues until `current_period_end`.

```
POST /billing/subscription/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be canceled at the end of the current billing period"
}
```

---

### Payment Webhooks (server-to-server)

These endpoints are called by Stripe and CryptoCloud when payment events occur. They are **not** called by the dashboard; configure them in each provider's dashboard.

| Method | Endpoint | Provider |
|--------|----------|----------|
| POST | `/webhooks/billing/stripe` | Stripe – send **Stripe-Signature** header; configure in Stripe Dashboard |
| POST | `/webhooks/billing/cryptocloud` | CryptoCloud – send **X-Signature** or **Signature** header; configure in CryptoCloud |

**Environment variables:** `STRIPE_WEBHOOK_SECRET`, `CRYPTOCLOUD_WEBHOOK_SECRET` (and `STRIPE_SECRET_KEY`, `CRYPTOCLOUD_API_KEY`, `CRYPTOCLOUD_SHOP_ID` for creating checkouts).

---

## Document Management

Manage knowledge base documents for your tenant.

> **Asynchronous Processing:** Document uploads and URL ingestions are processed asynchronously. The initial response returns `status: "processing"` immediately. Use the **Get Document Status** endpoint to poll for completion.

> **Processing Times:**
> - Small files (< 10 pages): ~30 seconds
> - Medium files (10-50 pages): ~1-2 minutes
> - Large files (50-100 pages): ~2-5 minutes

> **Structured Entity Extraction:** Chat responses automatically include structured entities extracted from your knowledge base:
> - **Products** with pricing, descriptions, URLs, and image URLs
> - **URLs** and links found in documents (including image URLs)
> - **Contact information** (emails, phones) with inferred labels
> - **Pricing details** with associated plan/product URLs
> - **Services** with feature lists
> - **Locations** and addresses
>
> Product entities include optional `url` and `image_url` fields when available. Pricing entities are automatically linked to products, and URLs near product names are associated with those products. Images are extracted from content and stored in the URLs entity with `title: "image"`.
>
> These entities are returned in the `entities` field of message responses for SDK/API calls, enabling rich UI rendering in web clients while webhooks (Telegram, etc.) receive plain text only.

> **Internal Scraper Enhancements:** The URL ingestion feature is powered by a production-grade scraper with the following built-in capabilities:
> - **robots.txt Compliance** - Respects website robots.txt rules with per-host caching (24h TTL)
> - **Content Deduplication** - SHA256 hashing + ETag/Last-Modified caching to avoid re-downloading unchanged content
> - **Circuit Breaker** - Per-host circuit breakers with exponential backoff to handle failing servers gracefully
> - **Structured Extraction** - Extracts metadata, headings (h1-h6), tables, code blocks, and links from HTML
> - **Metrics & Observability** - Tracks requests, latency, errors, dedup stats, and circuit breaker events
> - **Sitemap Discovery** - Automatically parses sitemap.xml for URL discovery during crawls
>
> These enhancements work transparently - no API changes are required.

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
    "document_id": "uuid",
    "status": "processing"
  },
  "message": "Document uploaded successfully"
}
```

> **Note:** For very large documents, content is truncated when stored in the vector database to stay within the 10KB metadata limit. Full content remains available in the database for RAG retrieval.

---

### Ingest URL

Scrape and ingest content from a website URL. Use `crawl: true` for multi-page crawling or omit it for single-page ingestion.

```
POST /tenants/{tenant_id}/documents/ingest-url
```

**Single-Page Ingestion (Default):**

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
  "message": "URL ingestion started successfully"
}
```

**Multi-Page Crawling:**

**Request Body:**
```json
{
  "url": "https://example.com",
  "crawl": true,
  "options": {
    "max_pages": 50,
    "max_depth": 2,
    "include_sitemap": true,
    "include_hreflang": true,
    "same_domain_only": true,
    "excluded_paths": ["/api/", "/admin/", "/login"],
    "allowed_paths": []
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| url | string | Required | The starting URL to crawl |
| crawl | boolean | false | Set `true` to enable multi-page crawling |
| options | object | See defaults | Crawl options (used when `crawl: true`) |
| options.max_pages | int | 10 | Maximum pages to crawl (max 100) |
| options.max_depth | int | 1 | Maximum link depth to follow (max 5) |
| options.include_sitemap | bool | true | Parse sitemap.xml for URLs |
| options.include_hreflang | bool | true | Include hreflang localized URLs |
| options.same_domain_only | bool | true | Only crawl same domain pages |
| options.excluded_paths | array | ["/api/", "/admin/", "/login", ...] | Skip these path prefixes |
| options.allowed_paths | array | [] | Only crawl paths matching these (empty = all) |

**Crawl Response:**
```json
{
  "success": true,
  "data": {
    "document_ids": ["uuid-1", "uuid-2", "uuid-3"],
    "pages_found": 47,
    "pages_crawled": 50,
    "status": "processing",
    "url": "https://example.com"
  },
  "message": "URL crawling started successfully - 50 pages queued for processing"
}
```

**Crawl Features:**
- **Sitemap Discovery**: Automatically finds and parses `/sitemap.xml`, `/sitemap_index.xml`, and WordPress sitemaps
- **Hreflang Detection**: Discovers localized versions of pages (e.g., `/en/`, `/fr/`, `/de/`)
- **Link Discovery**: Follows internal links up to the specified depth
- **Smart Filtering**: Excludes common non-content paths (API, admin, login, cart, checkout)
- **Domain Restriction**: By default, only crawls pages from the same domain

**Plan Limits:**
- Each page crawled counts against your `max_urls_ingest_per_month` limit
- Free plan: 10 URL ingests/month
- Pro plan: 500 URL ingests/month
- Enterprise: Unlimited

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

**Status Values:**
| Status | Description |
|--------|-------------|
| `processing` | Document is being chunked and embedded |
| `completed` | Document successfully processed and searchable |
| `failed` | Processing failed (check logs for details) |

---

### Get Document Status

Get the current status and details of a specific document. Use this to poll for processing completion.

```
GET /tenants/{tenant_id}/documents/{document_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "name": "product-guide.md",
      "file_type": "text/markdown",
      "file_size": 15420,
      "status": "completed",
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:02:30Z"
    }
  }
}
```

**Polling Example:**
```javascript
async function uploadAndPoll(file, tenantId) {
  // 1. Upload document
  const uploadRes = await fetch(`/api/v1/tenants/${tenantId}/documents`, {
    method: 'POST',
    body: formData
  });
  const { data: { document } } = await uploadRes.json();

  // 2. Poll for completion
  while (true) {
    const statusRes = await fetch(
      `/api/v1/tenants/${tenantId}/documents/${document.id}`
    );
    const { data: { document: doc } } = await statusRes.json();

    if (doc.status === 'completed') {
      console.log('Document ready!');
      break;
    }
    if (doc.status === 'failed') {
      console.error('Processing failed');
      break;
    }

    // Wait 2 seconds before polling again
    await new Promise(r => setTimeout(r, 2000));
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

### Replace Document

Replace an existing document with a new file. This deletes the old chunks/vectors and processes the new content.

```
PUT /tenants/{tenant_id}/documents/{document_id}
```

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | New document file |

**Response:**
```json
{
  "success": true,
  "message": "Document replaced successfully. It will be processed in the background."
}
```

> **Note:** The document keeps the same ID. Old chunks are deleted from the vector database and replaced with new ones.

---

### Replace Document URL

Replace an existing URL-based document with a new URL. This deletes the old chunks/vectors and processes the new URL content.

```
POST /tenants/{tenant_id}/documents/{document_id}/replace-url
```

**Request Body:**
```json
{
  "url": "https://example.com/new-page"
}
```

**Response:**
```json
{
  "success": true,
  "message": "URL replaced successfully. It will be processed in the background."
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

## Structured Entity Extraction

Chat responses automatically include structured entities extracted from your knowledge base and AI responses. This enables rich UI rendering in web clients while maintaining plain text compatibility for webhooks.

### How Entity Extraction Works

1. **During RAG Search**: Entities are extracted from source document chunks (links, contacts, pricing from tables)
2. **From AI Response**: Entities are extracted from the generated response (URLs, emails, phone numbers)
3. **Both sources are merged** and returned in the `entities` field

### Entity Types

| Entity Type | Description | Example Fields |
|-------------|-------------|----------------|
| `products` | Products mentioned | name, price, description, url, image_url |
| `services` | Services offered | name, description, features[] |
| `urls` | Links found (including images) | url, title, anchor_text |
| `contacts` | Contact information | type (email/phone), value, label |
| `pricing` | Pricing details | product, price, currency, period, url |
| `locations` | Addresses | name, address, city, country |

### Response Format

**SDK/API Response (includes entities):**
```json
{
  "success": true,
  "data": {
    "response": "Our Premium Plan costs $99/month and includes 24/7 support.",
    "sources": [...],
    "entities": {
      "products": [
        {
          "name": "Premium Plan",
          "price": "$99/month",
          "description": "24/7 support",
          "url": "https://example.com/premium",
          "image_url": "https://example.com/images/premium.png"
        }
      ],
      "pricing": [
        {
          "product": "Premium Plan",
          "price": "$99",
          "period": "monthly",
          "url": "https://example.com/premium"
        }
      ],
      "contacts": [
        {"type": "email", "value": "support@example.com", "label": "support"}
      ],
      "urls": [
        {
          "url": "https://example.com/premium",
          "title": "Premium Plan",
          "anchor_text": "View Premium Plan"
        }
      ]
    }
  }
}
```

**Webhook Response (plain text only):**
```json
{
  "success": true,
  "data": {
    "response": "Our Premium Plan costs $99/month and includes 24/7 support."
  }
}
```

### Channel Behavior

| Channel | Entities | Description |
|---------|----------|-------------|
| **SDK** (Web/Mobile) | ✅ Yes | Full entities for rich UI rendering |
| **API** (Direct calls) | ✅ Yes | Full entities for JSON consumers |
| **Webhook** (Telegram/Facebook) | ❌ No | Plain text only (performance) |

### Viewing Entities in Messages

When you retrieve chat messages via the dashboard APIs, assistant messages include the `entities` field:

```json
{
  "id": "msg-uuid",
  "role": "assistant",
  "content": "Our Premium Plan costs $99/month...",
  "token_usage": {
    "sources": [...],
    "confidence": 0.92
  },
  "entities": {
    "products": [...],
    "pricing": [...]
  },
  "created_at": "2026-01-24T10:00:00Z"
}
```

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

## Custom System Prompt

Customize the AI's behavior by setting a system prompt for your tenant. This feature requires a Pro plan or higher.

> **Plan Requirement:** Custom system prompts require a Pro plan or Enterprise plan. Free plan users cannot set custom prompts.

### Set System Prompt

Set or update the custom system prompt for your tenant. Pass an empty string to clear and use the default prompt.

```
POST /tenants/{tenant_id}/system-prompt
```

**Request Body:**
```json
{
  "system_prompt": "You are a helpful customer support assistant for Acme Inc. Always respond in a friendly and professional tone."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| system_prompt | string | Yes | The custom system prompt. Empty string clears to default. |

**Response (Set):**
```json
{
  "success": true,
  "message": "System prompt updated successfully"
}
```

**Response (Cleared):**
```json
{
  "success": true,
  "message": "System prompt cleared (using default)"
}
```

**Error (Free Plan):**
```json
{
  "success": false,
  "error": "Custom system prompts require a Pro plan or higher. Upgrade your plan to use this feature."
}
```

---

### Get System Prompt

Retrieve the current system prompt for your tenant.

```
GET /tenants/{tenant_id}/system-prompt
```

**Response (Custom Prompt Set):**
```json
{
  "success": true,
  "data": {
    "system_prompt": "You are a helpful customer support assistant for Acme Inc.",
    "is_custom": true
  }
}
```

**Response (Using Default):**
```json
{
  "success": true,
  "data": {
    "system_prompt": "",
    "is_custom": false
  }
}
```

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
| Manage plans (CRUD) | ❌ | ❌ | ✅ |
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

## Admin APIs - User Subscription & Tenants

**Required Role:** `admin` or `super_admin`

APIs to view a user's current subscription, subscription history, and tenants they own.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Get User Subscription (Admin)

Get the **current (active)** subscription for any user.

```
GET /admin/users/{user_id}/subscription
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Response (has subscription):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "user_id": "uuid",
      "plan_id": "uuid",
      "provider": "stripe",
      "status": "active",
      "current_period_start": "2026-01-24T00:00:00Z",
      "current_period_end": "2026-02-24T00:00:00Z",
      "cancel_at_period_end": false
    },
    "plan": { "id": "uuid", "name": "Pro", "slug": "pro", "currency": "USD" }
  }
}
```

**Response (no subscription):**
```json
{
  "success": true,
  "data": {
    "subscription": null,
    "plan": null,
    "message": "No active subscription"
  }
}
```

---

### List User Subscriptions (History)

List **all** subscription records for a user (current and past; for support/audit).

```
GET /admin/users/{user_id}/subscriptions
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "plan_id": "uuid",
        "provider": "stripe",
        "status": "active",
        "current_period_start": "2026-01-24T00:00:00Z",
        "current_period_end": "2026-02-24T00:00:00Z",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### List User Tenants

List all tenants owned by a user.

```
GET /admin/users/{user_id}/tenants
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | uuid | The user's ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "Acme Support",
        "plan": "pro",
        "status": "active",
        "created_at": "2026-01-24T10:00:00Z",
        "updated_at": "2026-01-24T10:00:00Z"
      }
    ],
    "total": 2
  }
}
```

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

## Admin APIs - Tenant Chats, Messages & Analytics

**Required Role:** `super_admin` only

APIs to view chats, messages, and analytics for any tenant (support and operations).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### List Tenant Chats (Admin)

List paginated chats for any tenant.

```
GET /admin/tenants/{tenant_id}/chats
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response:** Same shape as [List Tenant Chats](#list-tenant-chats) (user): `chats`, `total`, `page`, `limit`.

---

### List Tenant Messages (Admin)

List paginated messages for a chat in any tenant.

```
GET /admin/tenants/{tenant_id}/chats/{chat_id}/messages
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |
| chat_id | uuid | The chat's ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |

**Response:** Same shape as [List Tenant Chat Messages](#list-tenant-chat-messages) (user): `messages`, `total`, `page`, `limit`.

---

### Get Tenant Analytics

Get aggregated analytics for a tenant: document/chat/message counts, feedback stats, and 30-day usage.

```
GET /admin/tenants/{tenant_id}/analytics
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| tenant_id | uuid | The tenant's ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant_id": "uuid",
    "documents_count": 12,
    "chats_count": 45,
    "messages_count": 320,
    "usage_30d": {
      "tokens_in": 15000,
      "tokens_out": 8000,
      "searches": 120,
      "requests": 95
    },
    "feedback": {
      "total": 28,
      "positive": 22,
      "negative": 6,
      "positive_percent": 78.57,
      "negative_percent": 21.43
    }
  }
}
```

---

## Admin APIs - Plan Management

**Required Role:** `super_admin` only

These APIs allow super administrators to create and manage billing plans. Plans define pricing (monthly/yearly), limits (projects, messages, documents, etc.), and feature flags. When Stripe is configured (`STRIPE_SECRET_KEY`), creating a plan automatically creates a Stripe Product and recurring Prices (monthly and yearly) and stores the price IDs on the plan.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### List Plans (Admin)

Same as user-facing `GET /billing/plans`; returns all active plans.

```
GET /admin/plans
```

**Response:** Same as [List Plans](#list-plans) (user billing).

---

### Create Plan

Create a new billing plan. If Stripe is configured, a Stripe Product and Prices are created automatically and saved on the plan.

```
POST /admin/plans
```

**Request Body:**
```json
{
  "name": "Pro",
  "slug": "pro",
  "description": "For growing teams",
  "currency": "USD",
  "price_monthly_cents": 2900,
  "price_yearly_cents": 29000,
  "is_active": true,
  "sort_order": 1,
  "features_summary": "10 projects, 50k messages/mo",
  "max_projects": 10,
  "max_messages_per_month": 50000,
  "max_documents": 500,
  "max_document_size_mb": 10,
  "enable_telegram_integration": true,
  "enable_feedback": true,
  "enable_custom_system_prompt": true,
  "enable_rag_enhancements": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Plan display name |
| slug | string | Yes | Unique slug (e.g. `pro`) |
| currency | string | Yes | e.g. `USD` |
| price_monthly_cents | int | Yes | Monthly price in cents |
| price_yearly_cents | int | No | Yearly price in cents |
| is_active | bool | No | Default `true` |
| sort_order | int | No | Display order |
| description, features_summary | string | No | For display |
| max_projects, max_messages_per_month, max_documents, max_document_size_mb | int | No | Plan limits |
| enable_* | bool | No | Feature flags |

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "b6215202-d167-45c1-a2dd-6d037fafee50",
      "name": "Pro",
      "slug": "pro",
      "currency": "USD",
      "price_monthly_cents": 2900,
      "price_yearly_cents": 29000,
      "gateway_one_price_id": "price_xxx",
      "gateway_one_yearly_price_id": "price_yyy",
      "is_active": true,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    }
  },
  "message": "Plan created successfully"
}
```

> **Note:** Set `STRIPE_SECRET_KEY` so Stripe Product/Prices are created automatically. Otherwise add `gateway_one_price_id` and `gateway_one_yearly_price_id` later via Update Plan or Stripe Dashboard.

---

### Get Plan

Get a single plan by ID.

```
GET /admin/plans/{plan_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| plan_id | uuid | The plan's ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "b6215202-d167-45c1-a2dd-6d037fafee50",
      "name": "Pro",
      "slug": "pro",
      "currency": "USD",
      "price_monthly_cents": 2900,
      "price_yearly_cents": 29000,
      "gateway_one_price_id": "price_xxx",
      "gateway_one_yearly_price_id": "price_yyy",
      "is_active": true,
      "created_at": "2026-01-24T10:00:00Z",
      "updated_at": "2026-01-24T10:00:00Z"
    }
  }
}
```

---

### Update Plan

Update an existing plan. Use to change pricing, limits, or Stripe/CryptoCloud price IDs.

```
PUT /admin/plans/{plan_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| plan_id | uuid | The plan's ID |

**Request Body:** Same fields as [Create Plan](#create-plan) (partial update supported).

**Response:**
```json
{
  "success": true,
  "message": "Plan updated successfully"
}
```

---

### Delete Plan

Deactivate a plan (soft delete). Existing subscribers keep access until their period ends; new signups cannot select this plan.

```
DELETE /admin/plans/{plan_id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| plan_id | uuid | The plan's ID |

**Response:**
```json
{
  "success": true,
  "message": "Plan deactivated successfully"
}
```

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
| GET | `/admin/users/{id}/subscription` | Get user's current subscription |
| GET | `/admin/users/{id}/subscriptions` | List user's subscription history |
| GET | `/admin/users/{id}/tenants` | List tenants owned by user |

### Tenant Management (super_admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/tenants` | List all tenants |
| GET | `/admin/tenants/{id}/chats` | List tenant chats (paginated) |
| GET | `/admin/tenants/{id}/chats/{chat_id}/messages` | List chat messages (paginated) |
| GET | `/admin/tenants/{id}/analytics` | Get tenant analytics |
| PUT | `/admin/tenants/{id}/status` | Update tenant status |
| DELETE | `/admin/tenants/{id}` | Delete tenant |

### Plan Management (super_admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/plans` | List all plans |
| POST | `/admin/plans` | Create plan (Stripe Product/Prices auto-created if configured) |
| GET | `/admin/plans/{id}` | Get plan by ID |
| PUT | `/admin/plans/{id}` | Update plan |
| DELETE | `/admin/plans/{id}` | Deactivate plan |

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

### 5. Create a Billing Plan (Super Admin)

```bash
# Create a plan (Stripe Product/Prices auto-created if STRIPE_SECRET_KEY is set)
curl -X POST http://localhost:8080/api/v1/admin/plans \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro",
    "slug": "pro",
    "currency": "USD",
    "price_monthly_cents": 2900,
    "price_yearly_cents": 29000,
    "is_active": true,
    "sort_order": 1
  }'
```

### 6. User Checkout Flow (Dashboard / Pricing Page)

```bash
# List plans (any authenticated user)
curl http://localhost:8080/api/v1/billing/plans \
  -H "Authorization: Bearer $TOKEN"

# Start checkout (redirect user to checkout_url)
curl -X POST http://localhost:8080/api/v1/billing/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": "PLAN_UUID", "provider": "stripe", "period": "monthly"}'

# Get current subscription
curl http://localhost:8080/api/v1/billing/subscription \
  -H "Authorization: Bearer $TOKEN"
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
TENANT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Support Bot", "plan": "pro"}')

TENANT_ID=$(echo $TENANT_RESPONSE | jq -r '.data.tenant.id')
PUBLIC_KEY_ID=$(echo $TENANT_RESPONSE | jq -r '.data.api_keys.public_key.id')
SECRET_KEY_ID=$(echo $TENANT_RESPONSE | jq -r '.data.api_keys.secret_key.id')

# 4. Retrieve API Keys (if you didn't save them)
PUBLIC_KEY=$(curl -s http://localhost:8080/api/v1/tenants/$TENANT_ID/api-keys/$PUBLIC_KEY_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.api_key.key')

SECRET_KEY=$(curl -s http://localhost:8080/api/v1/tenants/$TENANT_ID/api-keys/$SECRET_KEY_ID \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.api_key.key')

# 5. Upload Document
curl -X POST http://localhost:8080/api/v1/tenants/$TENANT_ID/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@knowledge-base.md"

# 6. Check Pending Questions
curl http://localhost:8080/api/v1/tenants/$TENANT_ID/pending-questions \
  -H "Authorization: Bearer $TOKEN"

# 7. View Feedback Stats
curl http://localhost:8080/api/v1/tenants/$TENANT_ID/feedback/stats \
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
