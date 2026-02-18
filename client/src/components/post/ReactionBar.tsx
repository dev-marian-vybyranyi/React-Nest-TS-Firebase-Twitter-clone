import { useReactionStore } from "@/store/useReactionStore";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";

import type { ReactionType } from "@/types/reaction";

interface ReactionBarProps {
  postId: string;
  initialLikes?: number;
  initialDislikes?: number;
  initialUserReaction?: ReactionType | null;
}

const ReactionBar = ({
  postId,
  initialLikes = 0,
  initialDislikes = 0,
  initialUserReaction = null,
}: ReactionBarProps) => {
  const { reactions, react, setReaction } = useReactionStore();

  const reaction = reactions[postId];

  useEffect(() => {
    if (!reaction) {
      setReaction(postId, {
        likes: initialLikes,
        dislikes: initialDislikes,
        userReaction: initialUserReaction,
      });
    }
  }, [
    postId,
    reaction,
    initialLikes,
    initialDislikes,
    initialUserReaction,
    setReaction,
  ]);

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
        <span>{reaction?.likes ?? initialLikes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${isDisliked ? "text-red-500" : "text-slate-500"}`}
        onClick={() => react(postId, "dislike")}
      >
        <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
        <span>{reaction?.dislikes ?? initialDislikes}</span>
      </Button>
    </div>
  );
};

export default ReactionBar;
