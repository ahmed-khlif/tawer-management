"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAcceptProjectInvitation from "@/modules/projects/hooks/members/use-accept-project-invitation";

interface AcceptInvitationPageRenderProps {
  token: string;
}

export default function AcceptInvitationPageRender({
  token,
}: AcceptInvitationPageRenderProps) {
  const { status, error, projectId } = useAcceptProjectInvitation({ token });

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Project invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "pending" ? (
            <>
              <Loader2 className="mx-auto size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Accepting your invitation…
              </p>
            </>
          ) : null}

          {status === "success" ? (
            <>
              <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
              <p className="text-sm">You&apos;ve joined the project.</p>
              {projectId ? (
                <Button asChild>
                  <Link href={`/dashboard/projects/${projectId}`}>Open project</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/dashboard/projects">Go to projects</Link>
                </Button>
              )}
            </>
          ) : null}

          {status === "error" ? (
            <>
              <XCircle className="mx-auto size-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/projects">Back to projects</Link>
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
