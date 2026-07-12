"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Paperclip, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useFileUpload } from "@/hooks/use-file-upload";
import CustomDialog from "@/components/custom-dialog";
import FilePreview from "reactjs-file-preview";
import {
  extractAssetPath,
  resolveAssetUrl,
} from "@/lib/resolve-asset-url";
import { AttachmentEmpty } from "../../shared/attachment-empty";
import {
  AttachmentRow,
  detectAttachmentKind,
} from "../../shared/attachment-row";

interface Props {
  inputName: string;
  previews?: string[];
  resetTrigger?: number;
}

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function fileNameFromUrl(url: string): string {
  return decodeName(url.split("/").pop() || "Untitled");
}

export default function AttachmentsUpload({
  inputName,
  previews,
  resetTrigger,
}: Props) {
  const t = useTranslations("modules.tasks");
  const form = useFormContext();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [alreadyCreatedAttachments, setAlreadyCreatedAttachments] = useState<
    string[]
  >([]);

  // EDITED: wrapped in useCallback to prevent form.setValue firing during render
  const handleFilesChange = useCallback(
    (files: any[]) => {
      const newFiles = files
        .filter((f) => f.file instanceof File)
        .map((f) => f.file as File);
      setTimeout(() => form.setValue("attachments", newFiles), 0);
    },
    [form],
  );

  const [fileState, fileActions] = useFileUpload({
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    initialFiles: [],
    onFilesChange: handleFilesChange,
  });

  const { clearFiles } = fileActions;

  useEffect(() => {
    if (previews) setAlreadyCreatedAttachments(previews);
  }, [previews]);

  useEffect(() => {
    if (resetTrigger && resetTrigger !== 0) {
      clearFiles();
      setAlreadyCreatedAttachments([]);
    }
  }, [resetTrigger]);

  const removeAlreadyCreatedAttachment = (attachment: string) => {
    if (!previews) return;
    setAlreadyCreatedAttachments((attachments) =>
      attachments.filter((a) => a !== attachment),
    );

    const attachmentPathname = extractAssetPath(attachment);
    const concatenatedDeletedAttachments = form.getValues(
      "deletedAttachments",
    ) as string;
    const currentAttachmentsToDelete = concatenatedDeletedAttachments
      ? concatenatedDeletedAttachments.split(",")
      : "";

    if (!currentAttachmentsToDelete.includes(attachmentPathname))
      form.setValue(
        "deletedAttachments",
        [attachmentPathname, ...currentAttachmentsToDelete].join(","),
      );
  };

  const viewAttachment = (attachment: string) => {
    setPreviewUrl(resolveAssetUrl(attachment));
    setIsPreviewOpen(true);
  };

  const downloadAttachment = (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = resolveAssetUrl(url);
    link.download = name;
    link.click();
  };

  const hasAnyAttachment =
    fileState.files.length > 0 || alreadyCreatedAttachments.length > 0;

  return (
    <>
      <FormField
        control={form.control}
        name={inputName}
        render={() => (
          <FormItem>
            <FormControl>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-medium">
                    <Paperclip className="size-3.5" />
                    {t("upload.form.labels.attachments")}
                  </h4>
                  <input
                    {...fileActions.getInputProps()}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fileActions.openFileDialog}
                    className="gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    {t("upload.form.labels.upload")}
                  </Button>
                </div>

                {fileState.errors.length > 0 && (
                  <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
                    {fileState.errors.map((error, index) => (
                      <p
                        key={index}
                        className="text-xs text-destructive flex items-center gap-1.5"
                      >
                        <X className="size-3" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {!hasAnyAttachment ? (
                  <AttachmentEmpty
                    title={t("upload.form.labels.noAttachments")}
                    description={t("upload.form.labels.noAttachmentsHint", {
                      defaultValue:
                        "Drop files here, or click to browse — up to 10 files, 10 MB each.",
                    })}
                    variant="dropzone"
                    isDragActive={fileState.isDragging}
                    onUpload={fileActions.openFileDialog}
                    uploadLabel={t("upload.form.labels.upload")}
                    onDragOver={fileActions.handleDragOver}
                    onDragLeave={fileActions.handleDragLeave}
                    onDrop={fileActions.handleDrop}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {fileState.files.map((fileItem) => {
                      const isFile = fileItem.file instanceof File;
                      const fileName = isFile
                        ? (fileItem.file as File).name
                        : ((fileItem.file as any).url
                            ?.split("/")
                            .pop() as string) || "Unknown file";
                      const fileSize = isFile
                        ? (fileItem.file as File).size
                        : 0;
                      const kind = detectAttachmentKind(fileName);

                      return (
                        <AttachmentRow
                          key={fileItem.id}
                          name={fileName}
                          sizeBytes={fileSize}
                          kind={kind}
                          previewUrl={
                            kind === "image" ? fileItem.preview : undefined
                          }
                          meta={
                            <span className="text-primary font-medium">
                              {t("upload.form.labels.newFile", {
                                defaultValue: "New",
                              })}
                            </span>
                          }
                          onRemove={() => fileActions.removeFile(fileItem.id)}
                        />
                      );
                    })}

                    {alreadyCreatedAttachments.map((attachment, idx) => {
                      const name = fileNameFromUrl(attachment);
                      const kind = detectAttachmentKind(name);
                      const resolvedUrl = resolveAssetUrl(attachment);
                      return (
                        <AttachmentRow
                          key={`${idx}-${attachment}`}
                          name={name}
                          kind={kind}
                          previewUrl={kind === "image" ? resolvedUrl : undefined}
                          onView={() => viewAttachment(attachment)}
                          onDownload={() => downloadAttachment(attachment, name)}
                          onRemove={() =>
                            removeAlreadyCreatedAttachment(attachment)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <CustomDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={t("filePreview")}
        className="max-w-4xl max-h-[90vh] overflow-auto"
      >
        {previewUrl && (
          <div className="mt-4">
            <FilePreview preview={previewUrl} />
          </div>
        )}
      </CustomDialog>
    </>
  );
}
