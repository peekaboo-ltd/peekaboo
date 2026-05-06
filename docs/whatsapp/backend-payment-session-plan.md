# WhatsApp Flow backend payment-session implementation

## Overview

Peekaboo now keeps the Meta WhatsApp Flow JSON in `docs/whatsapp/order-create-flow.json` and wires it to backend services through a dedicated encrypted Flow data-exchange endpoint. The implementation reuses the existing public order, Urubuto payment, WhatsApp messaging, and order activity primitives while adding a local 5-hour timeout for unpaid WhatsApp Flow payment sessions.

## Flow endpoint

The Flow JSON submits the terminal payload to:

```text
POST /api/v1/whatsapp/flows/order-create
```

The controller decrypts Meta's encrypted Flow request, passes the decrypted payload to `WhatsappFlowService`, and encrypts the response back to Meta. Required environment variables are:

- `WHATSAPP_FLOW_PRIVATE_KEY`: RSA private key for Flow request decryption.
- `WHATSAPP_ORDER_FLOW_ID`: published Meta Flow ID used when sending the Flow CTA.
- `WHATSAPP_PAYMENT_SESSION_TTL_HOURS`: backend-authoritative timeout, default `5`.
- `WHATSAPP_ORDER_INITIAL_FEE`: backend-authoritative fee, default `1500`.

## Order and payment creation

On `action: create_order_payment_session`, the backend:

1. Validates that the sender, recipient, pickup, drop-off, confirmation, and quoted fee are present and valid.
2. Normalizes WhatsApp/Rwanda phone numbers into the same `2507...` format used by the existing WhatsApp webhook path.
3. Creates or reuses an active WhatsApp conversation for the sender.
4. Calls `OrderService.createPublicOrder` with the sender, recipient, conversation ID, order notes, description, and configured fee.
5. Calls `PaymentService.createPayment` with Urubuto as the provider and stores the WhatsApp session metadata on the payment.
6. Sends the hosted payment URL to the user as a WhatsApp CTA URL interactive message.
7. Returns an encrypted Flow response with the order reference, tracking ID, and payment-session expiry timestamp.

## Payment session metadata

WhatsApp Flow payments store these metadata fields:

- `source: 'whatsapp_flow'`
- `conversationId`
- `orderId`
- `flowToken`
- `paymentSessionStartedAt`
- `paymentSessionExpiresAt`
- `whatsappCustomerServiceWindowExpiresAt`
- `paymentReminderTemplateCandidate`
- Pickup/drop-off form details for support and future geocoding.

The 5-hour timeout is always computed server-side. The Flow JSON's `payment_session_ttl_minutes: 300` value is retained only as form-level context and must not be treated as authoritative by the backend.

## Session invalidation

`PaymentService.expireStaleWhatsappPaymentSessions` powers the expiry flow. It finds pending WhatsApp Flow payments whose `paymentSessionExpiresAt` is in the past and which have not already been locally expired. For every expired payment it:

1. Adds `localSessionExpiredAt` to payment metadata.
2. Marks the related conversation as `PAYMENT_EXPIRED`.
3. Adds a `CANCELLED` order activity once, with a WhatsApp payment-session expiry note.
4. Sends one free-form WhatsApp expiry message only if the saved `whatsappCustomerServiceWindowExpiresAt` is still in the future.

`startWhatsappPaymentSessionCronJobs` runs this invalidation every 10 minutes from the primary cluster process alongside the existing billing/report cron jobs.

## Late payment reconciliation

If a provider webhook marks a locally expired WhatsApp Flow payment as successful, `PaymentService.updatePaymentStatus` records `paidAfterWhatsappSessionExpired: true`, reactivates the related conversation, and then keeps the existing paid-order behavior: creating the `PAID` activity and starting rider assignment exactly once.

## WhatsApp helper APIs

The WhatsApp helper now includes:

- `sendFlowMessage` for the initial native WhatsApp Flow CTA.
- `sendCtaUrlMessage` for hosted Urubuto/Kpay payment links.
- `sendUtilityTemplate` for future approved utility templates.
- The existing `sendMessage` remains available for the legacy state machine.

## Rollout checklist

1. Upload and publish `docs/whatsapp/order-create-flow.json` in Meta Business Manager or through the WhatsApp Flows API.
2. Set `WHATSAPP_ORDER_FLOW_ID` to the published Flow ID.
3. Set `WHATSAPP_FLOW_PRIVATE_KEY` to the private key matching the public key configured for the WhatsApp Business phone number.
4. Verify the data-exchange endpoint with Meta's Flow testing tools.
5. Submit utility templates for payment confirmed, rider assigned, and payment expired notifications before relying on out-of-window WhatsApp messaging.
6. Monitor expired sessions and late successful payments after launch.
