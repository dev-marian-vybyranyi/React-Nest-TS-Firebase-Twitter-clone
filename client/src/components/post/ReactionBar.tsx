import { useAuthStore } from "@/store/useAuthStore";
import { useReactionStore } from "@/store/useReactionStore";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";

interface ReactionBarProps {
  postId: string;
}

const ReactionBar = ({ postId }: ReactionBarProps) => {
  const { reactions, react, fetchStats } = useReactionStore();
  const { user } = useAuthStore();

  const reaction = reactions[postId];

  useEffect(() => {
    fetchStats(postId);
  }, [postId, user?.uid]);

  const isLiked = reaction?.userReaction === "like";
  const isDisliked = reaction?.userReaction === "dislike";

  return (
    <div className="flex items-center gap-2 mx-2">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isLiked ? "text-blue-600" : "text-slate-500"}`}
        onClick={() => react(postId, "like")}
      >
        <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        <span>{reaction?.likes ?? 0}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isDisliked ? "text-red-500" : "text-slate-500"}`}
        onClick={() => react(postId, "dislike")}
      >
        <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
        <span>{reaction?.dislikes ?? 0}</span>
      </Button>
    </div>
  );
};

export default ReactionBar;
