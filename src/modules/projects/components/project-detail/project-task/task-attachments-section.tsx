"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import useTaskAttachments from "@/modules/projects/hooks/tasks/use-task-attachments";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { AttachmentEmpty } from "../../shared/attachment-empty";
import {
  AttachmentRow,
  detectAttachmentKind,
} from "../../shared/attachment-row";

interface TaskAttachmentsSectionProps {
  projectId: string;
  taskId: string;
  attachments?: Array<
    string | { id?: string; url?: string; attachment?: string; name?: string }
  >;
  onViewAttachment: (url: string) => void;
  permissions?: ProjectPermissions;
}

interface NormalizedAttachment {
  id?: string;
  url: string;
  name: string;
}

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function normalize(
  raw: TaskAttachmentsSectionProps["attachments"],
): NormalizedAttachment[] {
  return (raw ?? []).map((attachment) => {
    if (typeof attachment === "string") {
      return {
        url: attachment,
        name: decodeName(attachment.split("/").pop() || "Untitled"),
      };
    }
    const url = attachment.url ?? attachment.attachment ?? "";
    const resolvedUrl = resolveAssetUrl(url);
    return {
      id: attachment.id,
      url: resolvedUrl,
      name:
        attachment.name ?? decodeName(url.split("/").pop() || "Untitled"),
    };
  });
}

function downloadUrl(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}

export function TaskAttachmentsSection({
  projectId,
  taskId,
  attachments,
  onViewAttachment,
  permissions,
}: TaskAttachmentsSectionProps) {
  const t = useTranslations("modules.projects.project.taskAttributes");
  const { remove } = useTaskAttachments(projectId, taskId);
  const items = normalize(attachments);

  return (
    <div className="space-y-2 p-4">
      <h4 className="text-sm font-medium">
        {t("form.labels.attachments", { defaultValue: "Attachments" })}
      </h4>
      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((attachment, idx) => {
            const kind = detectAttachmentKind(attachment.name);
            return (
              <AttachmentRow
                key={attachment.id ?? `${idx}-${attachment.url}`}
                name={attachment.name}
                kind={kind}
                previewUrl={kind === "image" ? attachment.url : undefined}
                onView={() => onViewAttachment(attachment.url)}
                onDownload={() => downloadUrl(attachment.url, attachment.name)}
                onRemove={
                  permissions?.canManageTaskAttachments && attachment.id
                    ? () => remove.mutate(attachment.id!)
                    : undefined
                }
                removeDisabled={remove.isPending}
              />
            );
          })}
        </div>
      ) : (
        <AttachmentEmpty
          title={t("form.labels.noAttachments", {
            defaultValue: "No attachments yet",
          })}
          description={t("form.labels.noAttachmentsHint", {
            defaultValue:
              "Files attached to this task — screenshots, specs, exports — will appear here.",
          })}
        />
      )}
    </div>
  );
}
