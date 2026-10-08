import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { AuditLog } from './entities/auditLog.entity';
import { Batch } from './entities/batch.entity';
import { BusinessPlan } from './entities/businessPlan.entity';
import { Conversation } from './entities/conversation.entity';
import { LocationSearchSession } from './entities/locationSearchSession.entity';
import { Log } from './entities/log.entity';
import { Message } from './entities/message.entity';
import { Order } from './entities/order.entity';
import { OrderActivity } from './entities/orderActivity.entity';
import { OrderAssignment } from './entities/orderAssignment.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationBilling } from './entities/organizationBilling.entity';
import { OrganizationMembership } from './entities/organizationMembership.entity';
import { Payment } from './entities/payment.entity';
import { PendingOrderSession } from './entities/pendingOrderSession.entity';
import { PushSubscription } from './entities/pushSubscription.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserProblemReport } from './entities/userProblemReport.entity';
import { UserRole } from './entities/userRole.entity';
import { UserStatusProof } from './entities/userStatusProof.entity';

const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: dbPort,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    AuditLog,
    Batch,
    BusinessPlan,
    Conversation,
    LocationSearchSession,
    Log,
    Message,
    Order,
    OrderActivity,
    OrderAssignment,
    Organization,
    OrganizationBilling,
    OrganizationMembership,
    Payment,
    PendingOrderSession,
    PushSubscription,
    Role,
    User,
    UserProblemReport,
    UserRole,
    UserStatusProof,
  ],
  migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
  subscribers: [AuditSubscriber],
  ssl: ['localhost', 'host.docker.internal'].includes(
    String(process.env.DB_HOST)
  )
    ? false
    : { rejectUnauthorized: false },
});
