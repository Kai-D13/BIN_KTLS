import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
  loginAsAdmin: (password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isAdmin: false,
      login: (password: string) => {
        const isValid = password === process.env.NEXT_PUBLIC_APP_PASSWORD;
        if (isValid) {
          set({ isAuthenticated: true, isAdmin: false });
        }
        return isValid;
      },
      loginAsAdmin: (password: string) => {
        const isAdminValid = password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (isAdminValid) {
          set({ isAuthenticated: true, isAdmin: true });
        }
        return isAdminValid;
      },
      logout: () => set({ isAuthenticated: false, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface FilterStore {
  hubName: string;
  employeeName: string;
  searchText: string;
  weekLabel: string;
  status: string;
  setHubName: (hub: string) => void;
  setEmployeeName: (employee: string) => void;
  setSearchText: (text: string) => void;
  setWeekLabel: (week: string) => void;
  setStatus: (status: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  hubName: '',
  employeeName: '',
  searchText: '',
  weekLabel: '',
  status: '',
  setHubName: (hub) => set({ hubName: hub }),
  setEmployeeName: (employee) => set({ employeeName: employee }),
  setSearchText: (text) => set({ searchText: text }),
  setWeekLabel: (week) => set({ weekLabel: week }),
  setStatus: (status) => set({ status }),
  resetFilters: () => set({ hubName: '', employeeName: '', searchText: '', weekLabel: '', status: '' }),
}));
