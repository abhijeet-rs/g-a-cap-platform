import { create } from 'zustand';
import { Role, Permission } from '@/lib/types';
import { roleMap, roles, canDo } from '@/data/roles';

interface AuthState {
  screen: 'login' | 'app';
  role: Role;
  email: string;
  password: string;
  authLoading: boolean;
  login: () => void;
  logout: () => void;
  setEmail: (e: string) => void;
  setPassword: (p: string) => void;
  switchRole: (newRole: Role) => void;
  can: (perm: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  screen: 'login',
  role: 'am',
  email: '',
  password: '',
  authLoading: false,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  switchRole: (newRole) => set({ role: newRole }),
  login: () => {
    set({ authLoading: true });
    const prefix = get().email.split('@')[0];
    const role = roleMap[prefix] || 'am';
    setTimeout(() => {
      set({ screen: 'app', role, authLoading: false });
    }, 900);
  },
  logout: () => set({ screen: 'login', email: '', password: '', authLoading: false }),
  can: (perm) => canDo(get().role, perm),
}));

// Derived hook that re-renders when role changes
export function useUserInfo() {
  const role = useAuthStore(s => s.role);
  const info = roles[role];
  return {
    userName: info?.name ?? 'User',
    userRole: info?.label ?? 'User',
    userShort: info?.short ?? 'U',
    userColor: info?.color ?? '#5B6770',
  };
}
