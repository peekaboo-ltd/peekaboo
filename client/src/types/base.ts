import { type UUID } from 'crypto';
export { type UUID } from 'crypto';

export interface BaseDomain {
  id?: UUID;
  createdAt?: Date;
  updatedAt?: Date;
};
