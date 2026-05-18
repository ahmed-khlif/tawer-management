"use client";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CameraIcon, CircleUserRoundIcon, Trash2Icon } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  inputName?: string;
  defaultImageUrlInputName?: string;
  defaultImageUrl?: string | null;
  completionPercentage?: number;
}

export default function ProfileImageUpload({
  inputName = "image",
  defaultImageUrlInputName = "imageUrl",
  defaultImageUrl = null,
  completionPercentage
}: Props) {
  const { control } = useFormContext();

  const [
    { files, isDragging },
    {
      openFileDialog,
      removeFile,
      getInputProps,
      handleDrop,
      handleDragOver,
      handleDragEnter,
      handleDragLeave
    }
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/webp",
    multiple: false
  });

  const [defaultImageUrlIsDisplayed, setDefaultImageUrlIsDisplayed] = useState(true);
  const { onChange, ...inputProps } = getInputProps();

  const file = files[0];
  const previewUrl = file?.preview || (defaultImageUrlIsDisplayed ? defaultImageUrl : null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const size = 112; 
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = mounted && typeof completionPercentage === "number"
    ? circumference - (Math.max(0, Math.min(100, completionPercentage)) / 100) * circumference
    : circumference;

  return (
    <FormField
      name={inputName}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div
              className="relative inline-flex items-center justify-center align-top"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>
              {/* Circular Progress Ring */}
              {typeof completionPercentage === "number" && (
                <svg 
                  className="absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-90deg]" 
                  viewBox={`0 0 ${size} ${size}`}
                >
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className="stroke-border/40"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className="stroke-primary transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                  />
                </svg>
              )}

              {/* Avatar Preview */}
              <Avatar className="h-24 w-24 border-2 border-border/50">
                <AvatarImage src={previewUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-muted/50">
                  <CircleUserRoundIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                </AvatarFallback>
              </Avatar>

              {/* Hidden File Input */}
              <input
                {...inputProps}
                onChange={(e) => {
                  const fileList = e.target.files;
                  if (fileList && fileList.length > 0) {
                    field.onChange(fileList[0]);
                    onChange?.(e);
                  }
                }}
                className="sr-only"
              />

              {/* Upload Trigger Badge */}
              <button
                type="button"
                onClick={openFileDialog}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-4 ring-background transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={previewUrl ? "Change image" : "Upload image"}
              >
                <CameraIcon className="h-4 w-4" />
              </button>

              {/* Delete Trigger Badge (if image exists) */}
              {previewUrl && (
                <>
                  {defaultImageUrlInputName && defaultImageUrl ? (
                    <FormField
                      name={defaultImageUrlInputName}
                      render={({ field: defaultField }) => (
                        <>
                          {defaultImageUrl !== null && (
                            <input type="hidden" {...defaultField} value={defaultImageUrl} />
                          )}
                          <button
                            type="button"
                            className="absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm ring-4 ring-background transition-all hover:scale-105 hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onClick={() => {
                              defaultField.onChange("");
                              setDefaultImageUrlIsDisplayed(false);
                            }}
                            aria-label="Remove image"
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    />
                  ) : (
                    <button
                      type="button"
                      className="absolute top-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm ring-4 ring-background transition-all hover:scale-105 hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => {
                        removeFile(file?.id);
                        field.onChange(undefined);
                        setDefaultImageUrlIsDisplayed(false);
                      }}
                      aria-label="Remove image"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}

              {/* Hidden input for the default URL to keep form state in sync */}
              {defaultImageUrl && (
                <input
                  type="hidden"
                  name={defaultImageUrlInputName}
                  value={defaultImageUrlIsDisplayed ? defaultImageUrl : ""}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
