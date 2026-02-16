import { Card } from "@/components/ui/card";

interface Post {
  id: number;
  title: string;
  text: string;
  photo?: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="overflow-hidden shadow-sm bg-white pb-0">
      <div className="flex flex-col px-4 gap-4">
        <h3 className="font-semibold text-xl leading-tight text-slate-900">
          {post.title}
        </h3>
        <p className="text-slate-600 text-base leading-relaxed">{post.text}</p>
      </div>
      <div className="w-full h-auto overflow-hidden">
        {post.photo && (
          <img
            src={post.photo}
            alt={post.title}
            className="w-full h-auto object-cover max-h-[500px] rounded-lg"
            loading="lazy"
          />
        )}
      </div>
    </Card>
  );
};

export default PostCard;
