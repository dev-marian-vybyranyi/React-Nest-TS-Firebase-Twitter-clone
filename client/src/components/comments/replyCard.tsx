import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import { useState } from "react";
import ReplyForm from "./replyForm";

interface ReplyCardProps {
  reply: Comment;
  commentId: string;
}

const ReplyCard = ({ reply, commentId }: ReplyCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex gap-3 py-3 px-4 border-l-2 border-slate-200 ml-4 mt-2 bg-slate-50/50 rounded-r-md">
      <UserAvatar
        src={reply.authorPhotoURL}
        alt={reply.authorUsername}
        className="w-8 h-8"
      />
      <div className="flex flex-col flex-1 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-xs text-slate-900">
            {reply.authorUsername}
          </span>
          <span className="text-slate-500 text-[10px]">
            {formatDate(reply.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1 w-full">
            <ReplyForm
              commentId={commentId}
              postId={reply.postId}
              reply={reply}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-700">{reply.content}</p>
        )}
      </div>
      {/* Add reply dropdown */}
    </div>
  );
};

export default ReplyCard;
