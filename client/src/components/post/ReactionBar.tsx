import { useReactionStore } from "@/store/useReactionStore";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ReactionBarProps {
  postId: string;
}

const ReactionBar = ({ postId }: ReactionBarProps) => {
  const { reactions, react, fetchStats } = useReactionStore();
  const reaction = reactions[postId];

  useEffect(() => {
    fetchStats(postId);
  }, [postId]);

  const isLiked = reaction?.userReaction === "like";
  const isDisliked = reaction?.userReaction === "dislike";

  return (
    <div>
      <Button onClick={() => react(postId, "like")}>
        {isLiked ? <ThumbsUp fill="#3b82f6" /> : <ThumbsUp />}
        {reaction?.likes ?? 0}
      </Button>
      <Button onClick={() => react(postId, "dislike")}>
        {isDisliked ? <ThumbsDown fill="#3b82f6" /> : <ThumbsDown />}
        {reaction?.dislikes ?? 0}
      </Button>
    </div>
  );
};

export default ReactionBar;
