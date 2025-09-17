import { create } from 'zustand';

interface AppState {
  // Modal states
  createCampaignModal: boolean;
  reportModal: { open: boolean; campaignId?: number };
  userDetailModal: { open: boolean; userId?: number };
  
  // Service status
  serviceStatus: 'healthy' | 'degraded' | 'offline';
  
  // Search
  searchQuery: string;
  
  // Actions
  openCreateCampaign: () => void;
  closeCreateCampaign: () => void;
  openReport: (campaignId: number) => void;
  closeReport: () => void;
  openUserDetail: (userId: number) => void;
  closeUserDetail: () => void;
  setServiceStatus: (status: 'healthy' | 'degraded' | 'offline') => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  createCampaignModal: false,
  reportModal: { open: false },
  userDetailModal: { open: false },
  serviceStatus: 'healthy',
  searchQuery: '',
  
  openCreateCampaign: () => set({ createCampaignModal: true }),
  closeCreateCampaign: () => set({ createCampaignModal: false }),
  openReport: (campaignId) => set({ reportModal: { open: true, campaignId } }),
  closeReport: () => set({ reportModal: { open: false } }),
  openUserDetail: (userId) => set({ userDetailModal: { open: true, userId } }),
  closeUserDetail: () => set({ userDetailModal: { open: false } }),
  setServiceStatus: (status) => set({ serviceStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
