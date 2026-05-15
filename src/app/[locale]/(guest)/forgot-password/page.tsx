import AuthUIWrapper from "@/modules/auth/components/auth-ui-wrapper";
import ResetPassword from "@/modules/auth/components/reset-password";

export default function Page() {
  return (
    <AuthUIWrapper mode="reset">
      <ResetPassword />
    </AuthUIWrapper>
  );
}
