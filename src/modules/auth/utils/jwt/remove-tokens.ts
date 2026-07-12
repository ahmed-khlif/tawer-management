import useUserStore from "../../store/user-store";

export default function removeJWTTokens() {
  useUserStore.getState().clearSession();
}
