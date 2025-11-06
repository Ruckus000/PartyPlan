
import { create } from 'zustand';
import { Profile, Plan, Squad } from '../types';

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
}));
