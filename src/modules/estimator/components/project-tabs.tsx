"use client"

import { useTranslations } from "next-intl"
import { PlusIcon, Trash2Icon, PencilIcon, CheckIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { EstimationProject } from "../types/estimation"

interface Props {
  projects: EstimationProject[]
  activeProjectId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

export default function ProjectTabs({
  projects,
  activeProjectId,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: Props) {
  const t = useTranslations("modules.estimator.projects")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const startRename = (project: EstimationProject) => {
    setEditingId(project.id)
    setEditingName(project.name)
  }

  const commitRename = (id: string) => {
    if (editingName.trim()) onRename(id, editingName.trim())
    setEditingId(null)
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b pb-0 print:hidden">
      {projects.map((project) => (
        <div
          key={project.id}
          className={cn(
            "group relative flex items-center gap-1 border-b-2 px-3 py-2 text-sm transition-colors cursor-pointer select-none shrink-0",
            project.id === activeProjectId
              ? "border-primary text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => {
            if (editingId !== project.id) onSelect(project.id)
          }}
        >
          {editingId === project.id ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(project.id)
                  if (e.key === "Escape") setEditingId(null)
                }}
                className="h-6 w-32 px-1 py-0 text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => commitRename(project.id)}
              >
                <CheckIcon className="size-3" />
              </Button>
            </div>
          ) : (
            <>
              <span>{project.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PencilIcon className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); startRename(project) }}>
                    <PencilIcon className="mr-2 size-3.5" />
                    {t("renameProject")}
                  </DropdownMenuItem>
                  {projects.length > 1 && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDelete(project.id) }}
                    >
                      <Trash2Icon className="mr-2 size-3.5" />
                      {t("deleteProject")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={onAdd}
        title={t("addProject")}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  )
}
