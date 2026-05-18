"use client";

import { Download, FileDown, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportState = null | "csv" | "pdf";

interface ExportMenuButtonProps {
  exporting: ExportState;
  onExportCsv: () => void;
  onExportPdf: () => void;
  label?: string;
  align?: "start" | "center" | "end";
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  menuClassName?: string;
}

export function ExportMenuButton({
  exporting,
  onExportCsv,
  onExportPdf,
  label = "Export",
  align = "end",
  size = "sm",
  variant = "outline",
  className,
  menuClassName = "w-44",
}: ExportMenuButtonProps) {
  const triggerLabel =
    exporting === null
      ? label
      : exporting === "csv"
        ? "Exporting CSV..."
        : "Preparing PDF...";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={size}
          variant={variant}
          disabled={exporting !== null}
          className={className}
        >
          <Download className="size-4" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={menuClassName}>
        <DropdownMenuItem onClick={onExportCsv} disabled={exporting !== null}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPdf} disabled={exporting !== null}>
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
