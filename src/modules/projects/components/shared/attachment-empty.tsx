"use client";

import * as React from "react";
import { Paperclip, Upload } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttachmentEmptyProps {
  /** Main empty title (e.g. "No attachments yet"). */
  title: string;
  /** Optional secondary description line. */
  description?: string;
  /** Optional CTA — e.g. "Upload" button. */
  onUpload?: () => void;
  uploadLabel?: string;
  uploadDisabled?: boolean;
  className?: string;
  /**
   * When true the empty block is rendered with a dashed drop-zone style — used
   * inside create/update forms to make the area feel droppable. Defaults to
   * the read-only flat style used in detail panels.
   */
  variant?: "flat" | "dropzone";
  /** Drag-and-drop helpers (only meaningful for `variant="dropzone"`). */
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  /** When true, drop-zone shows a highlighted "drop here" state. */
  isDragActive?: boolean;
}

/**
 * Project-wide empty / drop-zone for attachment lists. Wraps shadcn `Empty`
 * with a consistent paperclip icon, optional CTA, and an optional dashed
 * drop-zone variant for create/update task forms.
 */
export function AttachmentEmpty({
  title,
  description,
  onUpload,
  uploadLabel = "Upload",
  uploadDisabled = false,
  className,
  variant = "flat",
  onDragOver,
  onDragLeave,
  onDrop,
  isDragActive = false,
}: AttachmentEmptyProps) {
  const isDropzone = variant === "dropzone";

  return (
    <Empty
      role={isDropzone ? "button" : undefined}
      tabIndex={isDropzone && onUpload ? 0 : undefined}
      onClick={isDropzone && onUpload ? onUpload : undefined}
      onKeyDown={
        isDropzone && onUpload
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onUpload();
              }
            }
          : undefined
      }
      onDragOver={isDropzone ? onDragOver : undefined}
      onDragLeave={isDropzone ? onDragLeave : undefined}
      onDrop={isDropzone ? onDrop : undefined}
      className={cn(
        "border bg-muted/30 py-6",
        isDropzone &&
          "border-dashed cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isDropzone &&
          isDragActive &&
          "border-primary bg-primary/5 ring-2 ring-primary/40",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isDropzone ? (
            <Upload className="size-5" />
          ) : (
            <Paperclip className="size-5" />
          )}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {onUpload && !isDropzone ? (
        <EmptyContent>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onUpload}
            disabled={uploadDisabled}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            {uploadLabel}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
