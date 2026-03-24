import { router } from '../trpc';
import { authRouter } from './auth';
import { memberRouter } from './member';
import { adminRouter } from './admin';
import { chatRouter } from './chat';

export const appRouter = router({
  auth: authRouter,
  member: memberRouter,
  admin: adminRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
