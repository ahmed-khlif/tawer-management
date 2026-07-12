import useUserStore from "../../store/user-store";

export default function extractJWTokens() {
  const access = useUserStore.getState().accessToken;

  return {
    access,
    refresh: null
  };
}
