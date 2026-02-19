import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { Link } from "react-router-dom";
import CreatePostDialog from "./post/createPostDialog";

const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-14 max-w-screen items-center justify-between px-4">
        <div className="flex items-center justify-between space-x-2 gap-4">
          <Link to="/">Twitter</Link>
          {user && <CreatePostDialog />}
        </div>

        <div className="flex items-center justify-between space-x-2">
          {user ? (
            <nav className="flex items-center">
              <Button variant="ghost" size="sm" className="px-0 gap-4" asChild>
                <Link to="/profile">
                  <span>{user.name}</span>
                  <UserAvatar
                    src={user.photo}
                    alt={user.name}
                    className="h-10 w-10"
                  />
                </Link>
              </Button>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/sign-in">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/sign-up">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
