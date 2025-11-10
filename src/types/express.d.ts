import { AuthenticatedUser } from './auth';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};

