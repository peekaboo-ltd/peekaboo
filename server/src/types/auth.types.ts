import { UUID } from 'crypto';
import { Request } from 'express';
import { User } from '../entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: {
    id: UUID;
    email: string;
    role: string;
  };
}

export interface AuthRequest extends Request {
  user?: User;
}
