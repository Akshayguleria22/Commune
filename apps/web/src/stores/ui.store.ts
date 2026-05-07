import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeCommunityId: string | null;
  theme: 'dark' | 'light';
  serverStarting: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveCommunity: (id: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setServerStarting: (starting: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  activeCommunityId: null,
  theme: 'dark',
  serverStarting: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveCommunity: (id) => set({ activeCommunityId: id }),
  setTheme: (theme) => set({ theme }),
  setServerStarting: (starting) => set({ serverStarting: starting }),
}));
