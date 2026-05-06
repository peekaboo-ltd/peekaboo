# WhatsApp Flow backend implementation notes

## Verification against the requested plan

| Plan item | Current implementation |
| --- | --- |
| Upload artifact lives at `server/whatsapp-flow.json` | Implemented. This JSON is the Meta upload artifact and is not served by the app. |
| Flow endpoint is `POST /api/v1/whatsapp/flows` | Implemented through the `/api/v1` route prefix and `router.post("/flows", ...)`. |
| Flow tokens are JWTs signed with `WHATSAPP_FLOW_TOKEN_SECRET` | Implemented when sending the Flow CTA, then verified in the Flow webhook before creating the order. |
| Flow request/response encryption uses RSA-OAEP-SHA256 and AES-128-GCM with the response IV flipped | Implemented in `server/src/helpers/whatsapp.flows.helper.ts`. |
| Conversations enter `PAYMENT_PENDING` after a Flow order creates a payment | Implemented in `WhatsappService.handleFlowSubmission`. |
| Sessions older than 5 hours in `PAYMENT_PENDING` expire | Implemented in `server/src/cron/whatsappSessionCron.ts`; it marks conversations `EXPIRED`, cancels unpaid orders, and sends a best-effort expiry text. |
| Payment confirmation remains Urubuto webhook-driven | Preserved. Existing payment webhook processing still creates `PAID` activity and assignment. |

## Required environment variables

```text
WHATSAPP_FLOW_ID
WHATSAPP_FLOW_TOKEN_SECRET
WHATSAPP_FLOW_PRIVATE_KEY
```

`WHATSAPP_ORDER_INITIAL_FEE` is still supported by the backend as an optional fee override; if omitted, the Flow path defaults to 1,500 RWF.

## Database migration required before deploy

PostgreSQL enum values must be added before deploying this code:

```sql
ALTER TYPE conversation_step_enum ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE conversation_status_enum ADD VALUE IF NOT EXISTS 'EXPIRED';
```

## Improvement retained from the previous implementation

The earlier payment-metadata idea is still useful for future analytics, but the current production expiry trigger intentionally follows the requested, simpler source of truth: `ConversationStep.PAYMENT_PENDING` plus `updatedAt < now - 5 hours`. This makes the expiry behavior easy to test manually and avoids depending on provider-specific payment metadata for the WhatsApp customer-service window.
