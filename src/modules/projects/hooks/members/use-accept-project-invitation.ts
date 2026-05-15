import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { acceptProjectInvitation } from "../../services";

interface Params {
  token: string;
  redirectOnSuccess?: boolean;
  redirectDelayMs?: number;
}

type AcceptStatus = "pending" | "success" | "error";

export default function useAcceptProjectInvitation({
  token,
  redirectOnSuccess = true,
  redirectDelayMs = 1500,
}: Params) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<AcceptStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing invitation token.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const member = await acceptProjectInvitation(token);
        if (cancelled) return;

        setProjectId(member?.projectId ?? null);
        setStatus("success");

        toast.success("Invitation accepted");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        if (member?.projectId) {
          queryClient.invalidateQueries({ queryKey: ["project", member.projectId] });
        }

        if (redirectOnSuccess && member?.projectId) {
          setTimeout(() => {
            if (!cancelled) router.push(`/dashboard/projects/${member.projectId}`);
          }, redirectDelayMs);
        }
      } catch (thrownError: any) {
        if (cancelled) return;

        if (thrownError?.response?.status === 401) {
          router.push("/login");
          return;
        }

        const message =
          thrownError?.response?.data?.message ||
          "We couldn't accept this invitation. It may have expired or already been used.";

        setStatus("error");
        setError(message);
        toast.error(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, redirectOnSuccess, redirectDelayMs, router, queryClient]);

  return { status, error, projectId };
}
