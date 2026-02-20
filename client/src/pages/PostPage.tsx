import { api } from "@/api/axios";
import LoadingState from "@/components/LoadingState";
import PostCard from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types/post";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Failed to fetch post", error);
        toast.error("Post not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Post not found
        </h2>
        <Button onClick={() => navigate("/")} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <PostCard post={post} />
    </div>
  );
};

export default PostPage;
