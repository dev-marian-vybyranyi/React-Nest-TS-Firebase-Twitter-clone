import { useReplyStore } from "@/store/useReplyStore";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import ReplyCard from "./replyCard";

interface ReplyListProps {
  commentId: string;
}

const ReplyList = ({ commentId }: ReplyListProps) => {
  const { replies, loadingStates, errors, fetchReplies } = useReplyStore();
  const commentReplies = replies[commentId] || [];
  const loading = loadingStates[commentId] || false;
  const error = errors[commentId] || null;

  useEffect(() => {
    fetchReplies(commentId);
  }, [commentId, fetchReplies]);

  if (loading && commentReplies.length === 0) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xs text-red-500 py-2">
        Failed to load replies
      </div>
    );
  }

  if (commentReplies.length === 0) {
    return (
      <div className="text-center text-slate-500">
        No replies yet. Be the first to reply!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      {commentReplies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} commentId={commentId} />
      ))}
    </div>
  );
};

export default ReplyList;
