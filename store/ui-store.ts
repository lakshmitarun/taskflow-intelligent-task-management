import { create } from "zustand";

interface UIStore {
  isSidebarOpen: boolean;
  searchQuery: string;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  searchQuery: "",
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

