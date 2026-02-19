import type { Comment } from "@/types/comment";
import { User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  return (
    <div className="flex gap-3 p-4 border-t border-slate-200">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {comment.authorPhotoURL ? (
          <img
            src={comment.authorPhotoURL}
            alt={comment.authorUsername}
            className="h-full w-full object-cover"
          />
        ) : (
              <User className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900">
            {comment.authorUsername}
          </span>
          <span className="text-slate-500 text-xs">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-700 mt-1">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export default CommentCard;
