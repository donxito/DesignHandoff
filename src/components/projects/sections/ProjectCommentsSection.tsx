"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { Avatar } from "@/components/retroui/Avatar";
import { Textarea } from "@/components/retroui/Textarea";
import { Text } from "@/components/retroui/Text";
import { Project } from "@/lib/types/project";
import { Comment } from "@/lib/types/comment";
import {
  useProjectCommentsRealtime,
  useCreateProjectComment,
} from "@/hooks/use-comments-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Clock, User, Bell } from "lucide-react";

interface ProjectCommentsSectionProps {
  project: Project;
}

export function ProjectCommentsSection({
  project,
}: ProjectCommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [lastCommentCount, setLastCommentCount] = useState(0);
  const [showNewCommentAlert, setShowNewCommentAlert] = useState(false);
  const { toast } = useToast();

  // * Get real project comments with realtime updates
  const {
    data: comments = [],
    isLoading,
    unreadCount,
  } = useProjectCommentsRealtime(project.id);

  // * Create project comment mutation
  const createCommentMutation = useCreateProjectComment();

  // * Show notification when new comments arrive
  useEffect(() => {
    if (comments.length > lastCommentCount && lastCommentCount > 0) {
      setShowNewCommentAlert(true);
      const timer = setTimeout(() => setShowNewCommentAlert(false), 3000);
      return () => clearTimeout(timer);
    }
    setLastCommentCount(comments.length);
  }, [comments.length, lastCommentCount]);

  // * Handle submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        projectId: project.id,
        content: newComment.trim(),
        // No x,y coordinates for project-level comments
      });

      setNewComment("");
      toast({
        message: "Comment posted",
        description: "Your comment has been added successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("❌ Error creating comment:", error);
      toast({
        message: "Failed to post comment",
        description: "Please try again",
        variant: "error",
      });
    }
  };

  // * Comment component
  const CommentComponent = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => (
    <div
      className={`${isReply ? "ml-8 mt-3" : ""} p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <Avatar variant="primary" className="w-8 h-8 flex-shrink-0">
          <Avatar.Fallback className="bg-blue-200 text-blue-800 text-xs">
            {comment.user?.full_name?.charAt(0) || "U"}
          </Avatar.Fallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Text
              as="span"
              className="font-bold font-pixel text-black dark:text-white text-sm"
            >
              {comment.user?.full_name || "Anonymous"}
            </Text>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <Text as="span" className="text-xs font-pixel">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </Text>
            </div>
          </div>

          <Text
            as="p"
            className="font-pixel text-black dark:text-white text-sm mb-2"
          >
            {comment.content}
          </Text>

          {!isReply && (
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto font-pixel hover:text-purple-600"
            >
              Reply
            </Button>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply: Comment) => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Real-time notification alert */}
      {showNewCommentAlert && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <Card className="p-3 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 shadow-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-600" />
              <Text className="font-pixel text-green-800 dark:text-green-200 text-sm">
                New comment added!
              </Text>
            </div>
          </Card>
        </div>
      )}

      {/* Comments Header */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              Project Comments
            </Text>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm" className="animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <Badge variant="secondary" size="sm">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <Text as="p" className="mb-6 font-pixel text-black dark:text-white">
          Share feedback, ideas, and collaborate with your team on this project.
          {comments.length === 0 && " Start the conversation!"} 💬
        </Text>

        {/* New Comment Form */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar variant="primary" className="w-8 h-8 flex-shrink-0">
              <Avatar.Fallback className="bg-pink-200 text-pink-800">
                <User className="h-4 w-4" />
              </Avatar.Fallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full mb-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmitComment}
                  disabled={
                    !newComment.trim() || createCommentMutation.isPending
                  }
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                  size="sm"
                >
                  {createCommentMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments List */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <Text
              as="p"
              className="font-pixel text-gray-600 dark:text-gray-300"
            >
              Loading comments...
            </Text>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CommentComponent comment={comment} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <Text
              as="h4"
              className="text-lg font-bold font-pixel text-black dark:text-white mb-2"
            >
              No Comments Yet
            </Text>
            <Text
              as="p"
              className="font-pixel text-gray-600 dark:text-gray-300"
            >
              Be the first to share your thoughts on this project.
            </Text>
          </div>
        )}
      </Card>

      {/* Comments Guidelines */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-3 border-blue-200 dark:border-blue-800">
        <Text
          as="h4"
          className="font-bold font-pixel text-blue-800 dark:text-blue-200 mb-2"
        >
          💡 Comment Guidelines
        </Text>
        <ul className="text-sm font-pixel text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Be constructive and specific in your feedback</li>
          <li>• Use @mentions to notify specific team members</li>
          <li>• Keep discussions focused on the project goals</li>
          <li>• Consider the context and timeline when providing feedback</li>
        </ul>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
