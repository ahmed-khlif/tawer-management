"use client";

import * as React from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImproveDescription } from "@/modules/ai/hooks/use-ai";
import { PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";

interface Props {
  entityType: "PROJECT" | "TASK" | "SPRINT" | "EPIC" | "MILESTONE";
  title?: string;
  description?: string;
  projectId?: string;
  onApply: (value: string) => void;
}

export function PmAiDescriptionAssist({
  entityType,
  title,
  description,
  projectId,
  onApply,
}: Props) {
  const improveMutation = useImproveDescription();
  const previewHtml = improveMutation.data?.improvedDescription?.trim() || "";

  const canImprove = !!title?.trim() || !!description?.trim();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        onClick={() =>
          improveMutation.mutate({
            entityType,
            title: title?.trim() || undefined,
            description: description?.trim() || undefined,
            projectId,
          })
        }
        disabled={!canImprove || improveMutation.isPending}
      >
        <WandSparkles className="mr-2 size-4" />
        {improveMutation.isPending ? "Improving..." : "Improve description"}
      </Button>
      {!canImprove ? (
        <p className="text-[11px] text-muted-foreground">
          Add a title or a draft description first.
        </p>
      ) : null}

      {improveMutation.data ? (
        <PmAiSuggestionCard
          title="Improved description"
          onDismiss={() => improveMutation.reset()}
          footer={
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply(improveMutation.data!.improvedDescription);
                improveMutation.reset();
              }}
            >
              Apply description
            </Button>
          }
        >
          {improveMutation.data.rationale ? (
            <p className="text-xs text-muted-foreground">{improveMutation.data.rationale}</p>
          ) : null}
          <div
            className="prose prose-sm max-w-none rounded-lg border bg-muted/15 p-3 text-sm text-foreground prose-p:my-2 prose-ul:my-2"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          {!previewHtml ? (
            <div className="rounded-lg border bg-muted/15 p-3 text-sm text-muted-foreground">
              No improved description was generated yet.
            </div>
          ) : null}
        </PmAiSuggestionCard>
      ) : null}
    </div>
  );
}

export default PmAiDescriptionAssist;
