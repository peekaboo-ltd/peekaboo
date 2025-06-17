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
The WhatsApp service (`src/services/whatsapp.service.ts`) handles all WhatsApp-related functionality:

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
Manages order creation, updates, and tracking:
- Order status management
- Order assignment
- Order activity logging
- Fee calculation

### User Service
Handles user-related operations:
- User creation and management
- Role assignment
- Authentication
- Profile management

### Conversation Service
Manages communication flows:
- Conversation tracking
- Message history
- Status management
- Step tracking

## 🔄 Conversation Flow

The WhatsApp integration follows a structured conversation flow:

1. **Initiation**: Initial customer contact
2. **Order Type Selection**: Customer selects service type
3. **Recipient Details**: Collection of delivery information
4. **Order Confirmation**: Verification of order details
5. **Order Processing**: Status updates and tracking
6. **Completion**: Order fulfillment and feedback

## 🔐 Security

- Environment variables for sensitive data
- Role-based access control
- Secure database connections
- Input validation
- Error handling middleware

