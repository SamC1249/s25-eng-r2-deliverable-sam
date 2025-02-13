"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/schema";

type Comment = Database["public"]["Tables"]["comments"]["Row"];

interface CommentsDialogProps {
  speciesId: number;      // ID of the species for which comments are being fetched
  sessionUserId: string;  // ID of the currently logged-in user
}

export default function CommentsDialog({
  speciesId,
  sessionUserId,
}: CommentsDialogProps): JSX.Element {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);

  const supabase = createBrowserSupabaseClient();

  // Fetch comments for the species
  const fetchComments = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("species_id", speciesId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error fetching comments:", errorMessage);
      toast({ title: "Error fetching comments.", variant: "destructive" });
    }
  };

  // Add a new comment
  const handleAddComment = async (): Promise<void> => {
    if (!newComment.trim()) {
      toast({ title: "Comment cannot be empty.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("comments").insert([
        {
          species_id: speciesId,
          user_id: sessionUserId,
          comment: newComment.trim(),
          created_at: new Date().toISOString(), // Ensure created_at is added
        },
      ]);

      if (error) throw error;

      toast({ title: "Comment added successfully!" });
      setNewComment("");
      await fetchComments();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error adding comment:", errorMessage);
      toast({ title: "Error adding comment.", variant: "destructive" });
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", sessionUserId);

      if (error) throw error;

      toast({ title: "Comment deleted successfully!" });
      await fetchComments();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error deleting comment:", errorMessage);
      toast({ title: "Error deleting comment.", variant: "destructive" });
    }
  };

  // Handle dialog open/close state and fetch comments when opened
  const handleOpenChange = (open: boolean): void => {
    setCommentsOpen(open);
    if (open) {
      fetchComments();
    }
  };

  return (
    <div >
      <Dialog open={isCommentsOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-6 h-6 p-0 flex items-center justify-center rounded-md"
          >
            💬
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogTitle>Comments</DialogTitle>
          <div className="my-4 max-h-60 overflow-y-auto">
            {comments.length > 0 ? (
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-2">
                    <p className="text-sm text-gray-200">{comment.comment}</p>
                    {comment.user_id === sessionUserId && (
                      <Button
                        className="w-10 h-6 fs-6 p-4 pr-6 pl-6"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
          <Input
            value={newComment}
            placeholder="Write a comment..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewComment(e.target.value)
            }
            className="mb-2"
          />
          <Button onClick={handleAddComment}>Add Comment</Button>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setCommentsOpen(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
