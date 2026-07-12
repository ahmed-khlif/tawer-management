import { create } from "zustand";

interface Store {
  fcmToken: string | null;
  setFcmToken: (token: string | null) => void;
}

export const useNotificationsTokensStore = create<Store>((set) => ({
  fcmToken: null,
  setFcmToken: (fcmToken) => set({ fcmToken }),
}));
