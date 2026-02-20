import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import CommentDropdown from "./CommentDropdown";
import { useState } from "react";
import CommentForm from "./commentForm";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex gap-3 p-4 border-t border-slate-200">
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
      </div>
      {!isEditing && (
        <CommentDropdown comment={comment} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default CommentCard;
