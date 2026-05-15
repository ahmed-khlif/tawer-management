import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectInvitation,
  deleteProjectInvitation,
  resendProjectInvitation,
} from "../../services";
import { CreateInvitationPayload } from "../../types/projects";

type ToastOptions = {
  silent?: boolean;
  successMessage?: string;
  errorMessage?: string;
};

export default function useProjectInvitations(projectId: string) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["project", projectId] });

  async function createInvitation(
    data: CreateInvitationPayload,
    options?: ToastOptions,
  ) {
    setIsPending(true);
    try {
      const result = await createProjectInvitation(projectId, data);
      if (!options?.silent) {
        toast.success(options?.successMessage || "Invitation sent");
      }
      invalidate();
      return result;
    } catch (err: any) {
      if (!options?.silent) {
        toast.error(
          options?.errorMessage ||
            err?.response?.data?.message ||
            "Failed to send invitation",
        );
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function revokeInvitation(invitationId: string, options?: ToastOptions) {
    setIsPending(true);
    try {
      await deleteProjectInvitation(projectId, invitationId);
      if (!options?.silent) {
        toast.success(options?.successMessage || "Invitation revoked");
      }
      invalidate();
    } catch (err: any) {
      if (!options?.silent) {
        toast.error(
          options?.errorMessage ||
            err?.response?.data?.message ||
            "Failed to revoke invitation",
        );
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  async function resendInvitation(invitationId: string, options?: ToastOptions) {
    setIsPending(true);
    try {
      await resendProjectInvitation(projectId, invitationId);
      if (!options?.silent) {
        toast.success(options?.successMessage || "Invitation resent");
      }
      invalidate();
    } catch (err: any) {
      if (!options?.silent) {
        toast.error(
          options?.errorMessage ||
            err?.response?.data?.message ||
            "Failed to resend invitation",
        );
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  }

  return { createInvitation, revokeInvitation, resendInvitation, isPending };
}
