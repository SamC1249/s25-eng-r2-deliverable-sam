"use client";

import React, { useState, useEffect } from "react";
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

export default function CommentsDialog({ speciesId, sessionUserId }) {
  const [comments, setComments] = useState([]); // State to hold fetched comments
  const [newComment, setNewComment] = useState(""); // State for new comment input
  const [isCommentsOpen, setCommentsOpen] = useState(false); // State for dialog visibility

  const supabase = createBrowserSupabaseClient();

  // Fetch comments for the species
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("species_id", speciesId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setComments(data || []); // Update state with fetched comments
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Error fetching comments.", variant: "destructive" });
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
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
      setNewComment(""); // Clear input field
      fetchComments(); // Refresh comments after adding
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Error adding comment.", variant: "destructive" });
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", sessionUserId); // Only allow deletion if the comment belongs to the current user

      if (error) throw error;

      toast({ title: "Comment deleted successfully!" });
      fetchComments(); // Refresh comments after deletion
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: "Error deleting comment.", variant: "destructive" });
    }
  };

  // Handle dialog open/close state and fetch comments when opened
  const handleOpenChange = (open) => {
    setCommentsOpen(open);
    if (open) fetchComments();
  };

  return (
    <div className="absolute bottom-3 right-3">
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
                      <Button className="w-10 h-6 fs-6 p-4 pr-6 pl-6"
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
              <p className="text-sm text-gray-400">No comments yet. Be the first to comment!</p>
            )}
          </div>
          {/* Input for adding a new comment */}
          <Input
            value={newComment}
            placeholder="Write a comment..."
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleAddComment}>Add Comment</Button>
          {/* Close Button */}
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
