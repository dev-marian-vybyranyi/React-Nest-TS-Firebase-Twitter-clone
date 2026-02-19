import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/comment";

interface CommentCardProps {
  comment: Comment;
}

const CommentCard = ({ comment }: CommentCardProps) => {
  return (
    <div className="flex gap-3 p-4 border-t border-slate-200">
      <UserAvatar src={comment.authorPhotoURL} alt={comment.authorUsername} />
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900">
            {comment.authorUsername}
          </span>
          <span className="text-slate-500 text-xs">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-700 mt-1">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentCard;
