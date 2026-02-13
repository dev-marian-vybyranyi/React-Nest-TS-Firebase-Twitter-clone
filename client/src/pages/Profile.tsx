import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, signOut, deleteUser, isLoading } = useAuthStore();
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
          <p className="font-medium text-sm bg-slate-100">
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

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
      <Card className="w-[380px] shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white overflow-hidden border-4 border-white shadow-sm">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-slate-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {user.name} {user.surname}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-slate-50 p-3 text-xs text-center text-muted-foreground">
            Account ID: {user.uid}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
