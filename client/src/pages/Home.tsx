import PostList from "@/components/post/PostList";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="px-96">
      <PostList posts={[]} />
    </div>
  );
};

export default Home;
