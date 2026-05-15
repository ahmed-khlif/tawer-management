"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import {
  DownloadIcon,
  UploadIcon,
  PrinterIcon,
  HelpCircleIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
  Loader2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  onExport: () => void
  onImport: (csvText: string) => void
  onCloudSave: () => void
  onCloudLoad: () => void
  isSaving?: boolean
  isLoadingFromCloud?: boolean
}

// Raw CSV example — technical content, intentionally not translated
const CSV_EXAMPLE = `project,entry_type,name,priority,working_days
My App,section,Foundation & Setup,,
My App,feature,Project scaffolding,Critical,2.5
My App,feature,Authentication,Critical,3
My App,feature,Admin dashboard,High,5
My App,section,Frontend,,
My App,feature,Landing page,High,2
My App,feature,Dashboard UI,Medium,3.5
Client B,section,Foundation,,
Client B,feature,Project scaffolding,Critical,2.5
Client B,feature,E-commerce catalog,Critical,5`

const CODE_STYLE = "text-xs bg-muted px-1 py-0.5 rounded font-mono"

export default function CsvActions({
  onExport,
  onImport,
  onCloudSave,
  onCloudLoad,
  isSaving,
  isLoadingFromCloud,
}: Props) {
  const t = useTranslations("modules.estimator")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (text) onImport(text)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const CSV_COLUMNS = [
    { name: "project",      desc: t("csv.guideColProjectDesc"),     required: true,  example: t("csv.guideColProjectExample") },
    { name: "entry_type",   desc: t("csv.guideColEntryTypeDesc"),   required: true,  example: t("csv.guideColEntryTypeExample") },
    { name: "name",         desc: t("csv.guideColNameDesc"),        required: true,  example: t("csv.guideColNameExample") },
    { name: "priority",     desc: t("csv.guideColPriorityDesc"),    required: false, example: t("csv.guideColPriorityExample") },
    { name: "working_days", desc: t("csv.guideColWorkingDaysDesc"), required: false, example: t("csv.guideColWorkingDaysExample") },
  ]

  const codeRenderer = (chunks: React.ReactNode) => (
    <code className={CODE_STYLE}>{chunks}</code>
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center justify-end gap-1.5 print:hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Cloud actions group ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 rounded-md border bg-card px-1.5 py-1">
          {/* Cloud Save */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5"
                onClick={onCloudSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <CloudUploadIcon className="size-3.5 text-primary" />
                )}
                <span className="hidden sm:inline text-xs">{t("csv.cloudSaveButton")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] text-xs leading-snug">
              {t("csv.cloudSaveTooltip")}
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border" />

          {/* Cloud Load */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5"
                onClick={onCloudLoad}
                disabled={isLoadingFromCloud}
              >
                {isLoadingFromCloud ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <CloudDownloadIcon className="size-3.5 text-primary" />
                )}
                <span className="hidden sm:inline text-xs">{t("csv.cloudLoadButton")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] text-xs leading-snug">
              {t("csv.cloudLoadTooltip")}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ── Local file actions group ─────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-md border bg-card px-1.5 py-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-3.5" />
                <span className="hidden md:inline text-xs">{t("csv.importButton")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t("csv.importButton")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5"
                onClick={onExport}
              >
                <DownloadIcon className="size-3.5" />
                <span className="hidden md:inline text-xs">{t("csv.exportButton")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t("csv.exportButton")}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5"
                onClick={() => window.print()}
              >
                <PrinterIcon className="size-3.5" />
                <span className="hidden md:inline text-xs">{t("print.button")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t("print.button")}</TooltipContent>
          </Tooltip>
        </div>

        {/* ── CSV Format Guide ─────────────────────────────────────────── */}
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                  <HelpCircleIcon className="size-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{t("csv.guideButton")}</TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-[80%] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("csv.guideTitle")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 text-sm">
              <p className="text-muted-foreground">{t("csv.guideIntro")}</p>

              {/* Column reference table */}
              <div>
                <p className="font-medium mb-2">{t("csv.guideColumns")}</p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[130px]">{t("csv.guideTableColumn")}</TableHead>
                        <TableHead>{t("csv.guideTableDescription")}</TableHead>
                        <TableHead className="w-[80px] text-center">{t("csv.guideTableRequired")}</TableHead>
                        <TableHead className="w-[100px]">{t("csv.guideTableExample")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CSV_COLUMNS.map((col) => (
                        <TableRow key={col.name}>
                          <TableCell className="font-mono text-xs font-semibold">{col.name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{col.desc}</TableCell>
                          <TableCell className="text-center">
                            {col.required ? (
                              <Badge variant="destructive" className="text-[10px] py-0">
                                {t("csv.guideRequiredYes")}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] py-0">
                                {t("csv.guideRequiredNo")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {col.example}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Live example */}
              <div>
                <p className="font-medium mb-2">{t("csv.guideExample")}</p>
                <pre className="rounded-lg bg-muted p-3 text-xs leading-relaxed overflow-x-auto whitespace-pre">
                  {CSV_EXAMPLE}
                </pre>
                <p className="mt-1.5 text-xs text-muted-foreground">{t("csv.guideExampleNote")}</p>
              </div>

              {/* Tips */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
                <p>• {t.rich("csv.guideTipMultiProject", { code: codeRenderer })}</p>
                <p>• {t.rich("csv.guideTipSections", { code: codeRenderer })}</p>
                <p>• {t.rich("csv.guideTipComments", { code: codeRenderer })}</p>
                <p>• {t.rich("csv.guideTipLegacy", { code: codeRenderer })}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
