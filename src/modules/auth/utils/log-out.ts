import { AxiosHeaders } from "axios";
import { POST } from "@/lib/http-methods";
import removeJWTTokens from "./jwt/remove-tokens";
import extractJWTokens from "./jwt/extract-tokens";

export async function logout() {
  const { access } = extractJWTokens();
  const headers = {} as AxiosHeaders;

  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  try {
    await POST("/auths/logout", headers, {});
  } finally {
    removeJWTTokens();
  }
}
