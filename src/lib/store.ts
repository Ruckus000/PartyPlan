
import { create } from 'zustand';
import { Profile, Plan, Squad, PendingOperation } from '../types';

type Store = {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  squads: Squad[];
  setSquads: (squads: Squad[]) => void;
  addSquad: (squad: Squad) => void;
  activeSquadId: string | null;
  setActiveSquadId: (squadId: string | null) => void;
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (planId: string, updates: Partial<Plan>) => void;
  removePlan: (planId: string) => void;
  editingPlan: Plan | null;
  setEditingPlan: (plan: Plan | null) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  pendingOperations: PendingOperation[];
  setPendingOperations: (ops: PendingOperation[]) => void;
  addPendingOperation: (op: PendingOperation) => void;
  removePendingOperation: (id: string) => void;
  updatePendingOperation: (id: string, updates: Partial<PendingOperation>) => void;
  getPendingDeleteIds: () => Set<string>;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
};

export const useStore = create<Store>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  squads: [],
  setSquads: (squads) => set({ squads }),
  addSquad: (squad) => set((state) => ({ squads: [...state.squads, squad] })),
  activeSquadId: null,
  setActiveSquadId: (squadId) => set({ activeSquadId: squadId }),
  plans: [],
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
  updatePlan: (planId, updates) => set((state) => ({
    plans: state.plans.map(p => p.id === planId ? { ...p, ...updates } : p)
  })),
  removePlan: (planId) => set((state) => ({
    plans: state.plans.filter(p => p.id !== planId)
  })),
  editingPlan: null,
  setEditingPlan: (plan) => set({ editingPlan: plan }),
  modalVisible: false,
  setModalVisible: (visible) => set({ modalVisible: visible }),
  pendingOperations: [],
  setPendingOperations: (ops) => set({ pendingOperations: ops }),
  addPendingOperation: (op) => set((state) => ({
    pendingOperations: [...state.pendingOperations, op]
  })),
  removePendingOperation: (id) => set((state) => ({
    pendingOperations: state.pendingOperations.filter(o => o.id !== id)
  })),
  updatePendingOperation: (id, updates) => set((state) => ({
    pendingOperations: state.pendingOperations.map(o =>
      o.id === id ? { ...o, ...updates } : o
    )
  })),
  getPendingDeleteIds: (): Set<string> => {
    const state = useStore.getState() as Store;
    return new Set(
      state.pendingOperations
        .filter((op: PendingOperation) => op.type === 'delete')
        .map((op: PendingOperation) => op.planId)
    );
  },
  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),
}));
