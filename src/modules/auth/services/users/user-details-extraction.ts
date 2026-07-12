import { GET } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { UserInResponseType, UserType } from "@/modules/users/types/users";
import { castToUserType } from "@/modules/users/utils/data-management/type-casting/users";
import { MOCK_USER } from "@/lib/mock-config";
import { getUseMockAuth } from "@/lib/mock-toggle"; // REMOVE THIS LINE FOR PROD

export async function retrieveUserDetails(): Promise<UserType | null> {
  if (getUseMockAuth()) return MOCK_USER; // REMOVE THIS LINE FOR PROD

  const { access } = extractJWTokens();
  if (!access) {
    return null;
  }

  const header = {
    Authorization: `Bearer ${access}`
  };

  try {
    const res = await GET(`/users/me`, header);
    const userData = res.data as UserInResponseType;

    return castToUserType(userData);
  } catch {
    return null;
  }
}
