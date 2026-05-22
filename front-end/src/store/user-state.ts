// store.ts
import { User } from "@/types/user";
import { create } from "zustand";

// Define types for state & actions
interface UserType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create store using the curried form of `create`
export const useUserStore = create<UserType>()((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
}));
