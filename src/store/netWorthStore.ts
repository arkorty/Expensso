import {create} from 'zustand';
import {Asset, Liability, Currency} from '../types';
import {
  getAssets,
  getLiabilities,
  insertAsset,
  insertLiability,
  updateAsset as updateAssetDb,
  updateLiability as updateLiabilityDb,
  deleteAsset as deleteAssetDb,
  deleteLiability as deleteLiabilityDb,
  getTotalAssets,
  getTotalLiabilities,
  saveNetWorthSnapshot,
} from '../db';

interface NetWorthState {
  assets: Asset[];
  liabilities: Liability[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  isLoading: boolean;

  // Actions
  loadNetWorth: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<void>;
  editAsset: (id: string, asset: Partial<Omit<Asset, 'id' | 'createdAt'>>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  addLiability: (liability: Omit<Liability, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<void>;
  editLiability: (id: string, liability: Partial<Omit<Liability, 'id' | 'createdAt'>>) => Promise<void>;
  removeLiability: (id: string) => Promise<void>;
  takeSnapshot: (currency: Currency) => Promise<void>;
}

export const useNetWorthStore = create<NetWorthState>((set, get) => ({
  assets: [],
  liabilities: [],
  totalAssets: 0,
  totalLiabilities: 0,
  netWorth: 0,
  isLoading: false,

  loadNetWorth: async () => {
    set({isLoading: true});
    try {
      const [assets, liabilities, totalA, totalL] = await Promise.all([
        getAssets(),
        getLiabilities(),
        getTotalAssets(),
        getTotalLiabilities(),
      ]);
      set({
        assets,
        liabilities,
        totalAssets: totalA,
        totalLiabilities: totalL,
        netWorth: totalA - totalL,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load net worth:', error);
      set({isLoading: false});
    }
  },

  addAsset: async (asset) => {
    await insertAsset(asset);
    await get().loadNetWorth();
  },

  editAsset: async (id, asset) => {
    await updateAssetDb(id, asset);
    await get().loadNetWorth();
  },

  removeAsset: async (id) => {
    await deleteAssetDb(id);
    await get().loadNetWorth();
  },

  addLiability: async (liability) => {
    await insertLiability(liability);
    await get().loadNetWorth();
  },

  editLiability: async (id, liability) => {
    await updateLiabilityDb(id, liability);
    await get().loadNetWorth();
  },

  removeLiability: async (id) => {
    await deleteLiabilityDb(id);
    await get().loadNetWorth();
  },

  takeSnapshot: async (currency) => {
    const {totalAssets, totalLiabilities} = get();
    await saveNetWorthSnapshot(totalAssets, totalLiabilities, currency);
  },
}));
