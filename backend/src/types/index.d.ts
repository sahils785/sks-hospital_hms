import { Role } from '@prisma/client';

export interface DecodedUser {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}
