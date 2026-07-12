import { POST } from "@/lib/http-methods";
import { AxiosError, AxiosHeaders, AxiosResponse } from "axios";
import { UserSignInType } from "../types";
import { CustomError } from "@/utils/custom-error";
import useUserStore from "../store/user-store";

type AuthResponse = {
  status: number;
  ok: boolean;
  errors?: string;
};

export async function signIn(data: UserSignInType): Promise<AuthResponse> {
  const headers = {} as AxiosHeaders;

  try {
    const res: AxiosResponse = await POST(`/auths/login`, headers, data);
    const session = res.data as { access: string };

    useUserStore.getState().setAccessToken(session.access);
    useUserStore.getState().setSessionReady(true);

    return { status: 204, ok: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ code: string; message: string }>;

    throw new CustomError(axiosError.message, axiosError?.response?.status || 500, axiosError.code);
  }
}
