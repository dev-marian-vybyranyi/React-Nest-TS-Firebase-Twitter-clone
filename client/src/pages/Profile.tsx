import PostList from "@/components/post/PostList";
import ProfileCard from "@/components/profile/ProfileCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate, useParams } from "react-router-dom";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";
import { useProfileActions } from "@/hooks/useProfileActions.tsx";
import { useUserStore } from "@/store/useUserStore";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, isLoading: authLoading } = useAuthStore();
  const { posts, loading: postLoading, getAllPostsByUserId } = usePostStore();
  const {
    viewedUser,
    loading: userLoading,
    getUserById,
    clearUser,
  } = useUserStore();
  const { handleSignOut, handleDeleteAccount } = useProfileActions();
  const navigate = useNavigate();

  const isOwnProfile = !userId || userId === currentUser?.uid;

  const displayUser = isOwnProfile ? currentUser : viewedUser;

  useEffect(() => {
    if (userId && userId !== currentUser?.uid) {
      getUserById(userId);
    } else {
      clearUser();
    }
  }, [userId, currentUser?.uid, getUserById, clearUser]);

  useEffect(() => {
    if (displayUser?.uid) {
      getAllPostsByUserId(displayUser.uid);
    }
  }, [displayUser?.uid, getAllPostsByUserId]);

  if (!currentUser) {
    navigate("/sign-in");
    return null;
  }

  if (userLoading || authLoading) {
    return <LoadingState />;
  }

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-slate-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="mx-auto max-w-6xl grid gap-6 grid-cols-[350px_1fr]">
        <div className="space-y-6">
          <ProfileCard
            user={displayUser}
            onSignOut={isOwnProfile ? handleSignOut : undefined}
            onDeleteAccount={isOwnProfile ? handleDeleteAccount : undefined}
            isLoading={authLoading}
          />
        </div>
        {postLoading ? <LoadingState /> : <PostList posts={posts} />}
      </div>
    </div>
  );
};

export default Profile;
