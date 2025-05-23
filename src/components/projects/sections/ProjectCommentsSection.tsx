import { useState } from "react";
import { Project } from "@/lib/types/project";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Avatar } from "@/components/retroui/Avatar";
import { Badge } from "@/components/retroui/Badge";
import { Textarea } from "@/components/retroui/Textarea";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Clock, User } from "lucide-react";

interface ProjectCommentsSectionProps {
  project: Project;
}

// Mock comment data structure
interface ProjectComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  replies?: ProjectComment[];
}

export function ProjectCommentsSection(
  {
    // project,
  }: ProjectCommentsSectionProps
) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock comments data
  // TODO: Fetch comments from API
  const [comments, setComments] = useState<ProjectComment[]>([
    {
      id: "1",
      content:
        "Great project! The design direction looks promising. Looking forward to seeing how this develops.",
      author: {
        id: "user1",
        name: "Alex Designer",
      },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "1-1",
          content:
            "Thanks! We're excited about the direction too. The team has been working hard on the user experience.",
          author: {
            id: "user2",
            name: "Jordan Developer",
          },
          created_at: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
    },
    {
      id: "2",
      content:
        "I have some feedback on the color palette. Could we schedule a meeting to discuss?",
      author: {
        id: "user3",
        name: "Sam Reviewer",
      },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // TODO: Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const comment: ProjectComment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: {
        id: "current-user",
        name: "You",
      },
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setIsSubmitting(false);
  };

  const CommentComponent = ({
    comment,
    isReply = false,
  }: {
    comment: ProjectComment;
    isReply?: boolean;
  }) => (
    <div
      className={`${isReply ? "ml-8 mt-3" : ""} p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-start gap-3">
        <Avatar variant="primary" className="w-8 h-8 flex-shrink-0">
          <Avatar.Fallback className="bg-blue-200 text-blue-800 text-xs">
            {comment.author.name.charAt(0)}
          </Avatar.Fallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Text
              as="span"
              className="font-bold font-pixel text-black dark:text-white text-sm"
            >
              {comment.author.name}
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
              className="text-xs p-0 h-auto font-pixel"
            >
              Reply
            </Button>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
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
          </div>
          <Badge variant="secondary" size="sm">
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <Text as="p" className="mb-6 font-pixel text-black dark:text-white">
          Share feedback, ideas, and collaborate with your team on this project.
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
                className="w-full mb-3"
              />

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {isSubmitting ? (
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
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
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
    </div>
  );
}
