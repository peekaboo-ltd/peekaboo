# Peekaboo Backend

A Node.js backend service for the Peekaboo application, built with Express.js and TypeORM, featuring WhatsApp integration for order management and communication.

## 🚀 Features

- WhatsApp Business API integration for order management
- User authentication and authorization
- Order tracking and management
- Real-time messaging and notifications
- Role-based access control
- PostgreSQL database integration
- Conversation management system

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- WhatsApp Business API credentials
- TypeScript

## 🛠️ Setup

1. Clone the repository:
```bash
git clone https://github.com/nishimweprince/peekaboo-be
cd peekabo-be
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory. Check `.env.example` file for required environment variables and their descriptions.

4. Run database migrations:
```bash
npm run typeorm:run-migrations
```

5. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── controllers/     # Request handlers
├── entities/        # TypeORM entities
├── middlewares/     # Express middlewares
├── routes/          # API routes
├── services/        # Business logic
├── templates/       # Message templates
├── validations/     # Request validation schemas
├── helpers/         # Utility functions
├── constants/       # Application constants
├── types/          # TypeScript type definitions
├── app.ts          # Express app configuration
├── data-source.ts  # Database configuration
└── server.ts       # Application entry point
```

## 📱 Core Services

### WhatsApp Service
The WhatsApp service ([whatsapp.service.ts](src/services/whatsapp.service.ts)) handles all WhatsApp-related functionality:

- Message handling and processing
- Order creation and management through WhatsApp
- Conversation flow management
- Template message sending
- User interaction handling

Key features:
- Automated order type selection
- Order status updates
- Customer communication
- Order tracking
- Message templating

### Order Service
The order service ([order.service.ts](src/services/order.service.ts)) manages order creation, updates, and tracking:
- Order status management
- Public order creation
- Order assignment
- Order activity logging
- Fee calculation
- Order cancellation and acceptance

### User Service
The user service ([user.service.ts](src/services/user.service.ts)) handles user-related operations:
- User creation and management
- Role assignment
- User authentication (projected)
- Profile management
- User status management

### Conversation Service
The conversation service ([conversation.service.ts](src/services/conversation.service.ts)) manages communication flows:
- Conversation tracking
- Message history
- Status management
- Step tracking
- Multi-step conversation flows

### Order Assignment Service
The order assignment service ([orderAssignment.service.ts](src/services/orderAssignment.service.ts)) manages rider assignments:
- Automatic rider assignment based on availability
- Load balancing across riders
- Assignment status management
- Re-assignment handling
- Assignment history tracking

### Audit Log Service
The audit log service ([auditLog.service.ts](src/services/auditLog.service.ts)) tracks system changes:
- Entity change tracking
- User action logging
- Before/after state comparison
- Audit trail for compliance
- Search and filter capabilities

### Payment Service
The payment service ([payment.service.ts](src/services/payment.service.ts)) manages payment processing with Kpay integration:
- Payment initiation and processing
- Support for multiple payment methods (Mobile Money, Credit Cards, SPENN, SmartCash)
- Payment status tracking and updates
- Webhook handling for payment notifications
- Automatic order status updates on successful payment
- Payer selection (Sender, Recipient, or Custom phone number)
- Rwanda phone number formatting (250XXXXXXXXX)
- Integration with Kpay payment gateway ([kpay.service.ts](src/integrations/kpay/kpay.service.ts))

## 🔄 Order Workflow

### Current Implementation

The application currently supports the following order trajectory:

1. **Create Public Order** ([order.service.ts:82-141](src/services/order.service.ts#L82-L141))
   - Order initiated via WhatsApp or API
   - Generates unique reference ID (prefix: `P`, 6 characters)
   - Creates sender and recipient users if they don't exist
   - Sets initial fee and status to `CREATED`
   - Logs order activity

2. **Add Location Information** ([order.entity.ts:54-65](src/entities/order.entity.ts#L54-L65))
   - **From Location**: Pickup location (latitude, longitude)
   - **To Location**: Delivery destination (latitude, longitude)
   - Stored as JSONB in database

3. **Assign Rider** ([orderAssignment.service.ts:28-107](src/services/orderAssignment.service.ts#L28-L107))
   - Automatically assigns available rider with fewest active assignments
   - Creates order assignment with `PENDING` status
   - Cancels previous active assignments for the order
   - Notifies customer via WhatsApp with rider contact

### Projected Order Trajectory

The following features are planned for implementation:

#### 1. **Payment Processing** ✅ (Implemented with Kpay)
   - ✅ Integration with Kpay payment gateway
   - ✅ Payment initiation and verification
   - ✅ Order status update to `PAID`
   - ✅ Webhook handling for payment notifications
   - ✅ Support for multiple payment methods (Mobile Money, Cards, SPENN, SmartCash)
   - ✅ Payer selection (Sender, Recipient, or Custom)
   - ✅ Phone number formatting for Rwanda
   - **Reference**: [payment.entity.ts](src/entities/payment.entity.ts), [kpay.service.ts](src/integrations/kpay/kpay.service.ts)

#### 2. **Order Re-assignment**
   - Ability to reassign order to different rider
   - Notification to both old and new riders
   - Assignment history tracking
   - Status management for reassignments

#### 3. **Rider Order Acceptance**
   - Rider receives order assignment notification
   - Accept/reject functionality
   - Timeout mechanism for non-responsive riders
   - Auto-reassignment on rejection

#### 4. **Order Completion Flow**
   - Order status progression:
     - `CREATED` → `PENDING` → `CONFIRMED` → `ACCEPTED` → `PAID` → `ACTIVE` → `IN_TRANSIT` → `DELIVERED` → `COMPLETED`
   - Delivery confirmation (photo, signature)
   - Customer confirmation
   - Automatic completion after delivery confirmation

#### 5. **Email Notifications** (Using [Resend](https://resend.com/docs/api-reference/introduction))
   - Order confirmation emails
   - Rider assignment notifications
   - Payment receipts
   - Delivery confirmations
   - Status update notifications
   - Order completion summary

#### 6. **Authentication & Authorization**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Session management
   - Token refresh mechanism
   - Secure password reset flow

#### 7. **User Registration**
   - Customer registration via WhatsApp/Web
   - Rider onboarding process
   - Admin user management
   - Email verification
   - Profile completion workflow

#### 8. **Role-Based Access Management**
   - Existing roles: `CUSTOMER`, `RIDER`, `ADMIN` ([role.constants.ts](src/constants/role.constants.ts))
   - Permission-based access control
   - Role assignment and modification
   - Protected routes and endpoints
   - Audit logging for role changes ([auditLog.entity.ts](src/entities/auditLog.entity.ts))

## 🔄 Conversation Flow

The WhatsApp integration follows a structured conversation flow:

1. **Initiation**: Initial customer contact
2. **Order Type Selection**: Customer selects service type (SEND/RECEIVE)
3. **Recipient Details**: Collection of delivery information
4. **Location Collection**: Pickup and delivery locations
5. **Order Confirmation**: Verification of order details
6. **Payment**: Payment processing and confirmation
7. **Rider Assignment**: Automatic rider allocation
8. **Order Processing**: Status updates and tracking
9. **Completion**: Order fulfillment and feedback

## 🎯 Suggested Additional Features

Based on the delivery/logistics application concept, consider implementing:

### Operations & Tracking
- **Real-time Location Tracking**: GPS tracking of riders during delivery
- **Route Optimization**: Suggest optimal routes for multiple deliveries
- **Delivery Time Estimation**: Calculate and display ETA to customers
- **Proof of Delivery**: Photo capture, digital signatures, QR codes
- **Order Scheduling**: Schedule deliveries for future dates/times

### Business Features
- **Dynamic Pricing**: Calculate fees based on distance, time, demand
- **Discount & Promo Codes**: Coupon system for customer acquisition
- **Rating & Reviews**: Customer feedback for riders and service quality
- **Rider Performance Analytics**: Track metrics (delivery time, ratings, completion rate)
- **Multi-stop Deliveries**: Support for multiple pickup/drop-off points

### Communication
- **In-app Messaging**: Direct chat between customer, rider, and support
- **Push Notifications**: Real-time updates via mobile notifications
- **SMS Fallback**: SMS notifications when internet unavailable
- **WhatsApp Status Updates**: Automated status updates via WhatsApp Business API

### Financial
- **Wallet System**: Digital wallet for customers and riders
- **Commission Management**: Track and manage rider commissions
- **Invoice Generation**: Automated invoicing for corporate clients
- **Payment Methods**: Multiple payment options (mobile money, cards, cash)
- **Refund Processing**: Automated refund workflow for cancelled orders

### Support & Safety
- **SOS/Emergency Button**: Safety feature for riders
- **Customer Support Ticketing**: Issue tracking and resolution system
- **Insurance Integration**: Package insurance for valuable items
- **Rider Verification**: Background checks and document verification
- **Dispute Resolution**: System for handling order disputes

### Analytics & Reporting
- **Business Dashboard**: KPIs, revenue, order trends
- **Heatmaps**: Visualize high-demand areas
- **Customer Insights**: Behavioral analytics and patterns
- **Rider Leaderboard**: Gamification for rider motivation
- **Export Reports**: CSV/PDF export for financial records

### Advanced Features
- **AI-powered Demand Forecasting**: Predict peak hours and demand
- **Fleet Management**: Vehicle tracking and maintenance scheduling
- **Zone-based Delivery**: Define and manage delivery zones
- **Batch Order Processing**: Handle bulk orders from businesses
- **API for Third-party Integration**: Allow external platforms to integrate

## 📊 Audit Logs Management

The application includes a comprehensive audit logging system to track all changes to critical entities, ensuring accountability and compliance.

### Audit Log Structure

The audit log system ([auditLog.entity.ts](src/entities/auditLog.entity.ts)) captures:

```typescript
{
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: "ORDER" | "ORDER_STATUS",
  entityId: "uuid",
  oldValues: { /* Previous state */ },
  newValues: { /* New state */ },
  createdById: "uuid",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Features

**Automated Tracking** ([auditLog.decorator.ts](src/decorators/auditLog.decorator.ts))
- `@AuditUpdate`: Decorator for tracking entity updates
- `@AuditDelete`: Decorator for tracking entity deletions
- Automatic before/after state comparison
- Non-blocking audit logging (failures don't affect operations)

**Audit Context** ([auditContext.middleware.ts](src/middlewares/auditContext.middleware.ts))
- Request-scoped user tracking
- Automatic user identification for audit trails
- Context propagation across service layers

**Supported Actions** ([auditLog.constants.ts](src/constants/auditLog.constants.ts))
- `CREATE`: New entity creation
- `UPDATE`: Entity modifications
- `DELETE`: Entity deletions

**Tracked Entities**
- Orders (`ORDER`)
- Order Status (`ORDER_STATUS`)
- Expandable to other critical entities

### Audit Log API

**Fetch Audit Logs** ([auditLog.service.ts](src/services/auditLog.service.ts))
```typescript
fetchAuditLogs({
  page: 0,
  size: 10,
  condition: {
    entityType: 'ORDER',
    entityId: 'specific-uuid',
    // or
    createdById: 'user-uuid',
    action: 'UPDATE'
  }
})
```

**Entity History**
```typescript
fetchEntityHistory({
  page: 0,
  size: 10,
  condition: {
    entityId: 'order-uuid',
    entityType: 'ORDER'
  }
})
```

### Usage Example

```typescript
// In service method
@AuditUpdate({
  entityType: AuditLogEntityTypes.ORDER,
  getEntityId: (args) => args[0], // First argument is entity ID
  getUserId: (args) => args[2]?.createdById, // Extract user ID from args
})
async updateOrder(id: UUID, order: Partial<Order>, options: UpdateOptions) {
  // Method implementation
  // Audit log is automatically created with before/after states
}
```

### Benefits

- **Compliance**: Meet regulatory requirements for data tracking
- **Accountability**: Track who made what changes and when
- **Debugging**: Trace data issues through change history
- **Security**: Detect unauthorized modifications
- **Transparency**: Provide audit trails for stakeholders
- **Rollback Support**: Reference previous states for recovery

## 🔐 Security

- Environment variables for sensitive data
- Role-based access control (RBAC)
- Secure database connections
- Input validation with Joi
- Error handling middleware
- Password hashing with bcrypt
- Comprehensive audit logging for all critical operations
- Context-aware user tracking in audit trails

