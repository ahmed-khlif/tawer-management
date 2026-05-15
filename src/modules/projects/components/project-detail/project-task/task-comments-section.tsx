"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ClockIcon, Heart, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { ProjectTaskComment } from "../../../types/project-tasks";
import { useTaskComment } from "@/modules/projects/hooks/tasks/use-task-comment";

interface TaskCommentsSectionProps {
  projectId: string;
  taskId: string;
  task: ProjectTaskType;
  comments: ProjectTaskComment[] | undefined;
  permissions: ProjectPermissions;
}

export function TaskCommentsSection({
  projectId,
  taskId,
  task,
  comments,
  permissions,
}: TaskCommentsSectionProps) {
  const tCommon = useTranslations("modules.projects.tasks");
  const { addComment, updateComment, deleteComment, likeComment } = useTaskComment(
    projectId,
    taskId,
  );
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleAdd = () => {
    if (!newComment.trim()) return;
    addComment.mutate(
      { content: newComment.trim() },
      { onSuccess: () => setNewComment("") },
    );
  };

  const startEditing = (comment: ProjectTaskComment) => {
    setEditingId(comment.id);
    setEditingText(comment.content);
  };

  const saveEdit = () => {
    if (!editingId || !editingText.trim()) return;
    updateComment.mutate(
      { commentId: editingId, content: editingText.trim() },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <div className="p-4">
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">
            {tCommon("upload.form.labels.comments")} ({comments.length})
          </h4>
          <div className="space-y-2">
            {comments.map((comment) => {
              const isOwn = permissions.isOwnComment(comment);
              const canEditThis =
                permissions.canUpdateAnyComment ||
                (permissions.canUpdateOwnComment && isOwn);
              const canDeleteThis =
                permissions.canDeleteAnyComment ||
                (permissions.canDeleteOwnComment && isOwn);

              return (
                <div
                  key={comment.id}
                  className="bg-muted group relative space-y-3 rounded-md p-3"
                >
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={updateComment.isPending}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{comment.content}</p>
                      {comment.authorName ? (
                        <p className="text-xs text-muted-foreground">
                          by {comment.authorName}
                        </p>
                      ) : null}
                    </>
                  )}

                  <div className="text-muted-foreground flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {format(new Date(comment.createdAt), "MMM d, yyyy - h:mm a")}
                    </div>
                    <div className="flex items-center">
                      {permissions.canLikeComment ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={comment.likedByMe ? "pm-text-project-stopped" : ""}
                          onClick={() => likeComment.mutate(comment.id)}
                          disabled={likeComment.isPending}
                        >
                          <Heart className="size-3" />
                          <span className="ml-1">{comment.likes ?? 0}</span>
                        </Button>
                      ) : null}
                      {canEditThis && editingId !== comment.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(comment)}
                        >
                          <Pencil className="size-3" />
                        </Button>
                      ) : null}
                      {canDeleteThis ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteComment.mutate(comment.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground rounded-md p-4 text-center text-sm mb-4">
          {tCommon("upload.form.labels.noComments")}
        </div>
      )}

      {permissions.canCreateComment ? (
        <div className="space-y-3 mt-4">
          <Textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={tCommon("upload.form.placeholders.comment")}
          />
          <div className="flex-1 flex justify-end">
            <Button onClick={handleAdd} disabled={addComment.isPending || !newComment.trim()}>
              {tCommon("actions.createComment")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TaskCommentsSection;
