import { useAuthStore } from "@/store/useAuthStore";
import { useReplyStore } from "@/store/useReplyStore";
import toast from "react-hot-toast";
import type { Comment } from "@/types/comment";
import ActionDropdown from "../ActionDropdown";

interface ReplyDropdownProps {
  reply: Comment;
  commentId: string;
  onEdit: () => void;
}

const ReplyDropdown = ({ reply, commentId, onEdit }: ReplyDropdownProps) => {
  const { deleteReply } = useReplyStore();
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteReply(commentId, reply.id, user.uid);
      toast.success("Reply deleted successfully");
    } catch {
      toast.error("Failed to delete reply");
    }
  };

  return (
    <ActionDropdown
      onEdit={onEdit}
      onDelete={handleDelete}
      deleteTitle="Delete Reply"
      deleteDescription="Are you sure you want to permanently delete this reply? This action is irreversible."
    />
  );
};

export default ReplyDropdown;
