import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '../../../server/src/routes';

export const trpc = createTRPCReact<AppRouter>();

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:3000';
}

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          const token = localStorage.getItem('worldmall_token');
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
