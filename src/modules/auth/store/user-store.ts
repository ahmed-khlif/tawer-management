import { UserType } from "@/modules/users/types/users";
import { create } from "zustand";

type Store = {
  isLoading: boolean;
  user: UserType | null;
  accessToken: string | null;
  sessionReady: boolean;
  setUser: (user: UserType | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setSessionReady: (sessionReady: boolean) => void;
  clearSession: () => void;
  setIsLoading: (isLoading: boolean) => void;
};

const useUserStore = create<Store>((set) => ({
  isLoading: true,
  user: null,
  accessToken: null,
  sessionReady: false,
  setUser: (user) =>
    set(() => ({
      user
    })),
  setAccessToken: (accessToken) =>
    set(() => ({
      accessToken
    })),
  setSessionReady: (sessionReady) =>
    set(() => ({
      sessionReady
    })),
  clearSession: () =>
    set(() => ({
      accessToken: null,
      user: null,
      sessionReady: true,
      isLoading: false
    })),
  setIsLoading: (isLoading) => set(() => ({ isLoading }))
}));

export default useUserStore;
