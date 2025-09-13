import type { BaseDomain } from './base';

export interface User extends BaseDomain {
  name?: string;
  email?: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  passwordHash?: string;
}
