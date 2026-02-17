import PostList from "@/components/post/PostList";
import ProfileCard from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import LoadingState from "@/components/LoadingState";

const Profile = () => {
  const { user, signOut, deleteUser, isLoading: authLoading } = useAuthStore();
  const { posts, loading: postLoading, getAllPostsByUserId } = usePostStore();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Success sign out");
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error("Error signing out");
    }
  };

  const handleDeleteAccount = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm">
            Are you sure you want to delete your account?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteUser();
                  toast.success("Account deleted");
                  navigate("/sign-up");
                } catch (error) {
                  toast.error("Failed to delete account");
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          minWidth: "300px",
        },
      },
    );
  };

  if (!user) {
    navigate("/sign-in");
    return null;
  }

  useEffect(() => {
    getAllPostsByUserId(user.uid);
  }, [getAllPostsByUserId, user.uid]);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="mx-auto max-w-6xl grid gap-6 grid-cols-[350px_1fr]">
        <div className="space-y-6">
          <ProfileCard
            user={user}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            isLoading={authLoading}
          />
        </div>
        {postLoading ? <LoadingState /> : <PostList posts={posts} />}
      </div>
    </div>
  );
};

export default Profile;
