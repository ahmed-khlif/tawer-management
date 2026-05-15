"use client"

import { useTranslations } from "next-intl"
import { Trash2Icon, PlusCircleIcon, FolderPlusIcon, InfoIcon, GripVerticalIcon } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { EstimationLine, EstimationProject, EstimatorConfig, Priority } from "../types/estimation"
import { PRIORITIES } from "../types/estimation"
import { calcLineAdjDays, formatCostExact } from "../utils/calculations"

interface Props {
  project: EstimationProject
  config: EstimatorConfig
  onAddLine: () => void
  onAddCategory: () => void
  onDeleteLine: (lineId: string) => void
  onUpdateLine: (lineId: string, partial: Partial<EstimationLine>) => void
  onReorderLines: (newLines: EstimationLine[]) => void
}

const PRIORITY_VARIANTS: Record<Priority, "destructive" | "warning" | "default" | "secondary"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "default",
  Low: "secondary",
}

const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "bg-red-50 dark:bg-red-950/30",
  High:     "bg-orange-50 dark:bg-orange-950/30",
  Medium:   "",
  Low:      "bg-slate-50 dark:bg-slate-900/20",
}

// ─── Header with tooltip ─────────────────────────────────────────────────────

function TH({ label, tip, className }: { label: React.ReactNode; tip: string; className?: string }) {
  return (
    <TableHead className={className}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 cursor-default select-none">
              {label}
              <InfoIcon className="size-3 text-muted-foreground/50 shrink-0" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px] text-xs leading-snug">
            {tip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableHead>
  )
}

// ─── Sortable category row ────────────────────────────────────────────────────

function SortableCategoryRow({
  line,
  onUpdateLine,
  onDeleteLine,
}: {
  line: EstimationLine
  onUpdateLine: (id: string, partial: Partial<EstimationLine>) => void
  onDeleteLine: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? ("relative" as const) : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="bg-muted/50 hover:bg-muted/50 border-l-2 border-l-primary/40"
    >
      {/* Drag handle */}
      <TableCell className="py-2 w-7 pl-2 pr-0">
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors focus-visible:outline-none"
          tabIndex={0}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>
      </TableCell>

      {/* Name — spans Priority + rawDays + adjDays columns */}
      <TableCell colSpan={4} className="py-2 pl-1">
        <Input
          value={line.name}
          onChange={(e) => onUpdateLine(line.id, { name: e.target.value })}
          className="h-6 border-none bg-transparent px-0 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-none focus-visible:ring-0 w-full"
        />
      </TableCell>

      {/* Cost column (empty) */}
      <TableCell />

      {/* Delete */}
      <TableCell className="py-2 pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground/50 hover:text-destructive"
          onClick={() => onDeleteLine(line.id)}
        >
          <Trash2Icon className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ─── Sortable item row ────────────────────────────────────────────────────────

function SortableItemRow({
  line,
  config,
  t,
  onUpdateLine,
  onDeleteLine,
}: {
  line: EstimationLine
  config: EstimatorConfig
  t: ReturnType<typeof useTranslations>
  onUpdateLine: (id: string, partial: Partial<EstimationLine>) => void
  onDeleteLine: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id })

  const adj = calcLineAdjDays(line.rawDays ?? 0, config.aiBoost)
  const cost = adj * config.ratePerDay
  const priorityBg = PRIORITY_COLORS[line.priority ?? "Medium"]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? ("relative" as const) : undefined,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group transition-colors ${priorityBg}`}
    >
      {/* Drag handle */}
      <TableCell className="py-1.5 w-7 pl-2 pr-0">
        <button
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/0 group-hover:text-muted-foreground/30 hover:!text-muted-foreground/70 transition-colors focus-visible:outline-none"
          tabIndex={0}
        >
          <GripVerticalIcon className="size-3.5" />
        </button>
      </TableCell>

      {/* Name */}
      <TableCell className="py-1.5 pl-1">
        <Input
          value={line.name}
          onChange={(e) => onUpdateLine(line.id, { name: e.target.value })}
          className="h-7 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
      </TableCell>

      {/* Priority */}
      <TableCell className="py-1.5">
        <Select
          value={line.priority ?? "Medium"}
          onValueChange={(v) => onUpdateLine(line.id, { priority: v as Priority })}
        >
          <SelectTrigger className="h-7 text-xs w-[108px] border-transparent bg-transparent shadow-none hover:border-input hover:bg-background transition-colors">
            <SelectValue>
              <Badge
                variant={PRIORITY_VARIANTS[line.priority ?? "Medium"]}
                className="text-[10px] py-0"
              >
                {t(`priorities.${line.priority ?? "Medium"}`)}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                <Badge variant={PRIORITY_VARIANTS[p]} className="text-[10px] py-0">
                  {t(`priorities.${p}`)}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Raw days */}
      <TableCell className="py-1.5">
        <Input
          type="number"
          min={0}
          step={0.25}
          value={line.rawDays ?? 0}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            onUpdateLine(line.id, { rawDays: isNaN(v) ? 0 : v })
          }}
          className="h-7 w-[80px] text-sm"
        />
      </TableCell>

      {/* AI-adjusted (read-only) */}
      <TableCell className="py-1.5 text-sm text-muted-foreground tabular-nums">
        {adj.toFixed(1)}
        <span className="text-[10px] ml-0.5">d</span>
      </TableCell>

      {/* Cost HT (read-only) */}
      <TableCell className="py-1.5 text-sm text-muted-foreground tabular-nums">
        {formatCostExact(cost, config.currency)}
        <span className="ml-1 text-[9px] text-muted-foreground/50">HT</span>
      </TableCell>

      {/* Delete */}
      <TableCell className="py-1.5 pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground/0 group-hover:text-muted-foreground/50 hover:!text-destructive transition-colors"
          onClick={() => onDeleteLine(line.id)}
        >
          <Trash2Icon className="size-3" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EstimationTable({
  project,
  config,
  onAddLine,
  onAddCategory,
  onDeleteLine,
  onUpdateLine,
  onReorderLines,
}: Props) {
  const t = useTranslations("modules.estimator.table")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const lines = project.lines
    const oldIdx = lines.findIndex((l) => l.id === active.id)
    const newIdx = lines.findIndex((l) => l.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    onReorderLines(arrayMove(lines, oldIdx, newIdx))
  }

  const totalRaw = project.lines
    .filter((l) => l.type === "item")
    .reduce((s, l) => s + (l.rawDays ?? 0), 0)
  const totalAdj = calcLineAdjDays(totalRaw, config.aiBoost)
  const totalCost = totalAdj * config.ratePerDay

  const lineIds = project.lines.map((l) => l.id)

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                {/* Handle column header — no label */}
                <TableHead className="w-7" />
                <TH
                  label={t("headers.name")}
                  tip={t("tooltips.name")}
                  className="w-[40%]"
                />
                <TH
                  label={t("headers.priority")}
                  tip={t("tooltips.priority")}
                  className="w-[120px]"
                />
                <TH
                  label={t("headers.rawDays")}
                  tip={t("tooltips.rawDays")}
                  className="w-[100px]"
                />
                <TH
                  label={t("headers.adjDays")}
                  tip={t("tooltips.adjDays", { boost: config.aiBoost.toFixed(1) })}
                  className="w-[90px] text-muted-foreground"
                />
                <TH
                  label={
                    <span className="inline-flex items-center gap-1">
                      {t("headers.cost")}
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal leading-tight">
                        HT
                      </Badge>
                    </span>
                  }
                  tip={t("tooltips.cost", { rate: config.ratePerDay })}
                  className="w-[130px] text-muted-foreground"
                />
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Empty state */}
              {project.lines.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FolderPlusIcon className="size-8 text-muted-foreground/30" />
                      {t("noItems")}
                    </div>
                  </TableCell>
                </TableRow>
              )}

              <SortableContext items={lineIds} strategy={verticalListSortingStrategy}>
                {project.lines.map((line) =>
                  line.type === "category" ? (
                    <SortableCategoryRow
                      key={line.id}
                      line={line}
                      onUpdateLine={onUpdateLine}
                      onDeleteLine={onDeleteLine}
                    />
                  ) : (
                    <SortableItemRow
                      key={line.id}
                      line={line}
                      config={config}
                      t={t}
                      onUpdateLine={onUpdateLine}
                      onDeleteLine={onDeleteLine}
                    />
                  ),
                )}
              </SortableContext>

              {/* Total row */}
              {project.lines.some((l) => l.type === "item") && (
                <TableRow className="border-t-2 font-semibold bg-muted/20 hover:bg-muted/20">
                  <TableCell className="w-7" />
                  <TableCell className="py-2.5 pl-1 text-sm">{t("total")}</TableCell>
                  <TableCell />
                  <TableCell className="py-2.5 text-sm tabular-nums">
                    {Math.round(totalRaw * 4) / 4}
                    <span className="text-[10px] ml-0.5 font-normal text-muted-foreground">d</span>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground tabular-nums">
                    {totalAdj.toFixed(1)}
                    <span className="text-[10px] ml-0.5">d</span>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm tabular-nums">
                    {formatCostExact(totalCost, config.currency)}
                    <span className="ml-1 text-[9px] text-muted-foreground/50">HT</span>
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={onAddLine}>
          <PlusCircleIcon className="mr-1.5 size-3.5" />
          {t("addFeature")}
        </Button>
        <Button variant="outline" size="sm" onClick={onAddCategory}>
          <FolderPlusIcon className="mr-1.5 size-3.5" />
          {t("addSection")}
        </Button>
      </div>
    </div>
  )
}
