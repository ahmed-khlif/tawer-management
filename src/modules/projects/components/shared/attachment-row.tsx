"use client";

import * as React from "react";
import {
  Download,
  Eye,
  File as FileGenericIcon,
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AttachmentRowKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "doc"
  | "spreadsheet"
  | "archive"
  | "code"
  | "file";

export interface AttachmentRowProps {
  /** Visible file name (already decoded). */
  name: string;
  /** Optional file size in bytes. */
  sizeBytes?: number;
  /** Optional secondary descriptor (e.g. "Image", "PDF", date string). */
  meta?: React.ReactNode;
  /** Pre-resolved kind (cuts off another extension parse). */
  kind?: AttachmentRowKind;
  /** Image preview URL (only used when `kind === "image"`). */
  previewUrl?: string;
  /** Click → open the preview dialog. Hidden when omitted. */
  onView?: () => void;
  /** Click → download the file. Hidden when omitted. */
  onDownload?: () => void;
  /** Click → remove. Hidden when omitted. */
  onRemove?: () => void;
  /** Disables the remove button (e.g. during pending mutation). */
  removeDisabled?: boolean;
  className?: string;
}

/**
 * Heuristic file-kind detection from a file name or URL. Used so the row
 * picks a sensible icon without callers having to import lucide separately.
 */
export function detectAttachmentKind(name: string): AttachmentRowKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (/^(jpe?g|png|gif|webp|svg|avif|bmp|ico)$/.test(ext)) return "image";
  if (/^(mp4|mov|webm|mkv|avi)$/.test(ext)) return "video";
  if (/^(mp3|wav|ogg|m4a|flac)$/.test(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (/^(doc|docx|odt|rtf|txt|md)$/.test(ext)) return "doc";
  if (/^(xls|xlsx|csv|ods)$/.test(ext)) return "spreadsheet";
  if (/^(zip|rar|7z|tar|gz)$/.test(ext)) return "archive";
  if (/^(js|ts|tsx|jsx|json|html|css|scss|py|java|go|rb|php|sh)$/.test(ext))
    return "code";
  return "file";
}

const KIND_ICONS: Record<AttachmentRowKind, React.ComponentType<{ className?: string }>> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  archive: FileArchive,
  code: FileCode,
  file: FileGenericIcon,
};

const KIND_LABELS: Record<AttachmentRowKind, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  pdf: "PDF",
  doc: "Document",
  spreadsheet: "Spreadsheet",
  archive: "Archive",
  code: "Code",
  file: "File",
};

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

/**
 * Single attachment row used across project task / sprint detail panels and
 * inside upload forms. Built on shadcn's `Item` primitive so spacing, focus
 * rings and hover state stay consistent project-wide.
 */
export function AttachmentRow({
  name,
  sizeBytes,
  meta,
  kind,
  previewUrl,
  onView,
  onDownload,
  onRemove,
  removeDisabled = false,
  className,
}: AttachmentRowProps) {
  const resolvedKind = kind ?? detectAttachmentKind(name);
  const Icon = KIND_ICONS[resolvedKind];
  const sizeLabel = typeof sizeBytes === "number" ? formatSize(sizeBytes) : "";

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn("bg-card hover:bg-muted/40 transition-colors", className)}
    >
      <ItemMedia>
        {resolvedKind === "image" && previewUrl ? (
          <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
            <img
              src={previewUrl}
              alt={name}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        )}
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="truncate" title={name}>
          {name}
        </ItemTitle>
        <ItemDescription className="text-xs text-muted-foreground truncate flex items-center gap-2">
          <span className="uppercase tracking-wider text-[10px] font-medium">
            {KIND_LABELS[resolvedKind]}
          </span>
          {sizeLabel ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{sizeLabel}</span>
            </>
          ) : null}
          {meta ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{meta}</span>
            </>
          ) : null}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="gap-0.5">
        {onView ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-primary hover:text-primary hover:bg-primary/10"
                onClick={onView}
                aria-label="Preview"
              >
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
        ) : null}
        {onDownload ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-primary hover:text-primary hover:bg-primary/10"
                onClick={onDownload}
                aria-label="Download"
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
        ) : null}
        {onRemove ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onRemove}
                disabled={removeDisabled}
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        ) : null}
      </ItemActions>
    </Item>
  );
}
