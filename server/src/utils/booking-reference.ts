import { v4 as uuidv4 } from 'uuid';

export const generateBookingReference = (): string => {
  const prefix = 'GC';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffixLength = 6;
  let suffix = '';
  for (let i = 0; i < suffixLength; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};

export const generateId = (): string => uuidv4().replace(/-/g, '').substring(0, 24);