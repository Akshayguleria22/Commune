import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeCommunityId: string | null;
  theme: 'dark' | 'light';

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveCommunity: (id: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  activeCommunityId: null,
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveCommunity: (id) => set({ activeCommunityId: id }),
  setTheme: (theme) => set({ theme }),
}));
