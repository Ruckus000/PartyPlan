
import { create } from 'zustand';
import { Profile, Plan } from '../types';

type Store = {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  plans: Plan[];
  setPlans: (plans: Plan[]) => void;
  addPlan: (plan: Plan) => void;
};

export const useStore = create<Store>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  plans: [],
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })), 
}));
