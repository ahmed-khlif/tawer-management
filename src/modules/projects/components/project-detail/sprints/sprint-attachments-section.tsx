"use client";

import * as React from "react";
import { Paperclip, UploadCloud } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";
import { useSprintAttachments } from "@/modules/projects/hooks/sprints/use-sprint-attachments";
import { AttachmentEmpty } from "../../shared/attachment-empty";
import {
  AttachmentRow,
  detectAttachmentKind,
} from "../../shared/attachment-row";

interface SprintAttachmentsSectionProps {
  projectId: string;
  sprintId: string;
  canManage?: boolean;
}

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function fileNameFromUrl(url: string): string {
  try {
    const u = new URL(url, "https://example.com");
    const pathname = u.pathname.split("/").filter(Boolean).pop();
    return decodeName(pathname ?? url);
  } catch {
    return decodeName(url.split("/").pop() ?? url);
  }
}

function downloadUrl(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
}

export function SprintAttachmentsSection({
  projectId,
  sprintId,
  canManage = false,
}: SprintAttachmentsSectionProps) {
  const { list, uploadAttachments, deleteAttachment } = useSprintAttachments(
    projectId,
    sprintId,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const attachments = list.data ?? [];
  const [isDragActive, setIsDragActive] = React.useState(false);

  const openFilePicker = () => {
    if (!canManage) return;
    fileInputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadAttachments.mutate(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="size-4" /> Attachments
        </CardTitle>
        {canManage ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => handleFiles(event.target.files)}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={openFilePicker}
              disabled={uploadAttachments.isPending}
              className="gap-1.5"
            >
              {uploadAttachments.isPending ? (
                <Spinner className="size-4" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              {uploadAttachments.isPending ? "Uploading…" : "Upload"}
            </Button>
          </>
        ) : null}
      </CardHeader>
      <CardContent>
        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-3/4" />
          </div>
        ) : attachments.length === 0 ? (
          <AttachmentEmpty
            title="No attachments yet"
            description={
              canManage
                ? "Drop files here, or click to browse, to attach context to this sprint."
                : "Files attached to this sprint will appear here."
            }
            variant={canManage ? "dropzone" : "flat"}
            isDragActive={isDragActive}
            onUpload={canManage ? openFilePicker : undefined}
            uploadLabel="Upload files"
            uploadDisabled={uploadAttachments.isPending}
            onDragOver={(e) => {
              if (!canManage) return;
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              if (!canManage) return;
              e.preventDefault();
              setIsDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => {
              const name = fileNameFromUrl(attachment.attachment);
              const kind = detectAttachmentKind(name);
              const resolvedUrl = resolveAssetUrl(attachment.attachment);
              return (
                <AttachmentRow
                  key={attachment.id}
                  name={name}
                  kind={kind}
                  previewUrl={kind === "image" ? resolvedUrl : undefined}
                  meta={format(new Date(attachment.createdAt), "MMM d, yyyy")}
                  onView={() => window.open(resolvedUrl, "_blank", "noreferrer")}
                  onDownload={() => downloadUrl(resolvedUrl, name)}
                  onRemove={
                    canManage
                      ? () => deleteAttachment.mutate(attachment.id)
                      : undefined
                  }
                  removeDisabled={deleteAttachment.isPending}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SprintAttachmentsSection;
