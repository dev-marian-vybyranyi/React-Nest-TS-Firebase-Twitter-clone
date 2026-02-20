import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import CommentDropdown from "./commentDropdown";
import { useState } from "react";
import CommentForm from "./commentForm";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import ReplyForm from "./replyForm";
import ReplyList from "./replyList";
import { useAuthStore } from "@/store/useAuthStore";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const { user } = useAuthStore();
  const isOwnPost = user?.uid === comment?.authorId;

  return (
    <div className="flex flex-col border-t border-slate-200">
      <div className="flex gap-3 p-4">
        <UserAvatar src={comment.authorPhotoURL} alt={comment.authorUsername} />
        <div className="flex flex-col flex-1 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-slate-900">
              {comment.authorUsername}
            </span>
            <span className="text-slate-500 text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <div className="mt-2 w-full">
              <CommentForm
                postId={comment.postId}
                comment={comment}
                onSuccess={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <p className="text-sm text-slate-700">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-slate-500 flex items-center gap-1"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">Reply</span>
              </Button>

              {(comment.replyCount > 0 || showReplies) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-blue-500 flex items-center gap-1"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="text-xs">
                    {showReplies
                      ? "Hide replies"
                      : `View ${comment.replyCount} replies`}
                  </span>
                </Button>
              )}
            </div>
          )}

          {isReplying && !isEditing && (
            <div className="mt-3">
              <ReplyForm
                commentId={comment.id}
                postId={comment.postId}
                onSuccess={() => {
                  setIsReplying(false);
                  setShowReplies(true);
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {showReplies && !isEditing && (
            <div className="mt-1">
              <ReplyList commentId={comment.id} />
            </div>
          )}
        </div>
        {!isEditing && isOwnPost && (
          <CommentDropdown
            comment={comment}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default CommentCard;
