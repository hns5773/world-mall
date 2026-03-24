import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  role: 'owner' | 'subadmin' | 'member';
  vipLevel?: number;
  balance?: string;
  language?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('worldmall_token'),
  user: JSON.parse(localStorage.getItem('worldmall_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('worldmall_token'),
  setAuth: (token, user) => {
    localStorage.setItem('worldmall_token', token);
    localStorage.setItem('worldmall_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  updateUser: (userData) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...userData } : null;
      if (updatedUser) {
        localStorage.setItem('worldmall_user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },
  logout: () => {
    localStorage.removeItem('worldmall_token');
    localStorage.removeItem('worldmall_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
