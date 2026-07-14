# X Channel Setup

This project now supports an X channel similar to the Telegram integration:

- Incoming direct messages
- Incoming mentions / replies to your X account
- Automatic AI replies
- Follow-up replies when an admin answers a pending question later

## Integration model

This integration is configured per tenant.

- Each tenant owner connects their own X app/account to their own tenant
- One tenant maps to one X connection in the current implementation
- Incoming X DMs and replies for that connected account are routed into that tenant's chats
- Outbound replies are sent using that tenant's stored X credentials

This usually means your customer, brand owner, or tenant admin connects their own X app. It does not mean every end-user chatting with the bot needs to create an X app.

## What each field means

When calling the connect API, the values come from these places:

- `tenant_id`
  Your Light RAG tenant ID. Get it from `GET /api/v1/tenants` or `GET /api/v1/tenants/{tenant_id}`.
- `jwt_token`
  Your Light RAG auth token, not an X token. Use the bearer token returned by your login endpoint.
- `api_key`
  The X app API Key from the X Developer Console.
- `api_secret`
  The X app API Secret from the X Developer Console.
- `access_token`
  The X user access token for the X account that should send DMs and replies.
- `access_token_secret`
  The X user access token secret for that same X account.
- `webhook_env`
  Your X Account Activity environment label/name.
- `register_webhook`
  Optional. If `true`, Light RAG tries to register and subscribe the webhook automatically after saving the credentials.

## Where to get the X credentials

Get these values from your X developer app:

1. Open your X Developer Console.
2. Select the app/account you want this tenant to use.
3. Open the app's `Keys and tokens` section.
4. Copy:
   `API Key`
   `API Secret`
   `Access Token`
   `Access Token Secret`
5. Find or create your Account Activity environment label for `webhook_env`.

Important:

- The connected X account is the account that will send replies.
- Your X app/account must have permission to post replies and use direct messages if you want both channels to work.
- If X does not grant the required permissions, credential validation may work while webhook registration or sending messages still fails.

## 1. Save X credentials for a tenant

Use the tenant API:

```bash
curl -X POST "http://localhost:8080/api/v1/tenants/{tenant_id}/x/config" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_X_API_KEY",
    "api_secret": "YOUR_X_API_SECRET",
    "access_token": "YOUR_X_ACCESS_TOKEN",
    "access_token_secret": "YOUR_X_ACCESS_TOKEN_SECRET",
    "webhook_env": "YOUR_ACTIVITY_ENV",
    "register_webhook": true
  }'
```

Notes:

- `register_webhook` is optional.
- If automatic registration fails, the API still stores the credentials and returns the webhook URL so you can finish setup manually.
- Credentials are stored encrypted in the database.

Example success response:

```json
{
  "success": true,
  "data": {
    "account_user_id": "123456789",
    "account_username": "your_brand",
    "message": "X credentials saved successfully",
    "webhook_url": "https://your-api.example.com/webhooks/x?tenant_id=YOUR_TENANT_ID"
  }
}
```

## 1.1 Check connection status

```bash
curl "http://localhost:8080/api/v1/tenants/{tenant_id}/x/config" \
  -H "Authorization: Bearer {jwt_token}"
```

Example response when connected:

```json
{
  "success": true,
  "data": {
    "x_integration": {
      "connected": true,
      "account_user_id": "123456789",
      "account_username": "your_brand",
      "webhook_env": "prod"
    }
  }
}
```

## 1.2 Disconnect X

```bash
curl -X DELETE "http://localhost:8080/api/v1/tenants/{tenant_id}/x/config" \
  -H "Authorization: Bearer {jwt_token}"
```

This removes the stored X credentials for the tenant. Existing mapped conversations remain in the database, but no new outbound X messages can be sent until the tenant reconnects.

## 1.3 Tenant details response

The tenant details endpoint now includes an `x_integration` block:

```bash
curl "http://localhost:8080/api/v1/tenants/{tenant_id}" \
  -H "Authorization: Bearer {jwt_token}"
```

Example shape:

```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "..."
    },
    "api_keys": [],
    "x_integration": {
      "connected": true,
      "account_user_id": "123456789",
      "account_username": "your_brand",
      "webhook_env": "prod"
    }
  }
}
```

## 2. Webhook URL

Each tenant gets its own webhook URL:

```text
{BASE_URL}/webhooks/x?tenant_id={tenant_id}
```

This endpoint supports:

- `GET` CRC checks from X
- `POST` webhook events

## 3. Supported inbound events

The webhook currently handles:

- `direct_message_events`
- `tweet_create_events`

For `tweet_create_events`, the app responds when the post:

- replies to the configured X account, or
- mentions the configured X username

## 4. Chat mapping behavior

- DMs are grouped by the remote X user ID.
- Public replies/mentions are grouped by the inbound post ID.
- Each X conversation is mapped to a normal Light RAG chat/session internally.
- Manual answers to pending questions can be sent back through the same X conversation later.

## 5. Admin answer notifications

If the assistant creates a pending question and a human answers it later:

- X DM conversations receive a DM
- X comment conversations receive a reply to the last inbound post

## 6. Important platform note

Your X app/account must have the required permissions for:

- webhooks / activity subscriptions
- direct messages
- posting replies

If those capabilities are not enabled on the X side, credential validation may succeed while webhook registration or message sending still fails.

## Quick summary

1. Tenant owner creates or chooses an X app/account.
2. Tenant owner gets the X keys/tokens from the X Developer Console.
3. Tenant owner connects those credentials to their tenant with `POST /api/v1/tenants/{tenant_id}/x/config`.
4. X sends DMs/replies to your webhook.
5. Light RAG replies using that tenant's connected X account.
